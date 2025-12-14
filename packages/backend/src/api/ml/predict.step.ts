import { ApiRouteConfig, FlowContext } from "@motiadev/core";
import { z } from "zod/v4";
import type {
  MotiaApiRequest,
  MotiaApiResponse,
} from "../../types/context-types.js";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const PythonExecutionRequestSchema = z.object({
  code: z.string().min(1, "Python code is required"),
  // Using object + passthrough instead of record() because zod/v4's ESM build
  // currently throws when parsing records in this runtime. Passthrough keeps
  // arbitrary keys while avoiding that bug.
  testData: z.object({}).passthrough().optional().default({}),
});

const PythonExecutionResultSchema = z.object({
  success: z.boolean(),
  result: z.any().optional(),
  error: z.string().optional(),
  error_type: z.string().optional(),
  traceback: z.string().optional(),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
});

export const config: ApiRouteConfig = {
  type: "api",
  name: "MLPredict",
  description:
    "Execute Python ML code via AWS Lambda and return predictions/metrics",
  path: "/ml/predict",
  method: "POST",
  emits: [],
  responseSchema: {
    200: PythonExecutionResultSchema,
    400: z.object({ error: z.string() }),
    500: z.object({ error: z.string(), config: z.any() }),
  },
};

export const handler = async (
  req: MotiaApiRequest<
    Record<string, unknown>,
    z.infer<typeof PythonExecutionRequestSchema>
  >,
  { logger }: FlowContext
): Promise<
  MotiaApiResponse<
    | z.infer<typeof PythonExecutionResultSchema>
    | { error: string; config?: unknown }
  >
> => {
  try {
    const parseResult = PythonExecutionRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn("Invalid ML predict request body", {
        issues: parseResult.error.issues,
      });
      return { status: 400, body: { error: "Invalid request body" } };
    }

    const hasRegion = !!process.env.AWS_REGION;
    const hasCredentials = !!(
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    );
    const hasFunctionName = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    if (!hasRegion || !hasCredentials || !hasFunctionName) {
      const cfg = {
        region: process.env.AWS_REGION || "not set",
        functionName: process.env.AWS_LAMBDA_FUNCTION_NAME || "not set",
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        configured: false,
      };
      logger.warn("AWS Lambda not configured", cfg as Record<string, unknown>);
      return {
        status: 500,
        body: { error: "AWS Lambda not configured", config: cfg },
      };
    }

    logger.info("Invoking AWS Lambda for Python ML execution", {
      codeLength: parseResult.data.code.length,
      testDataKeys: Object.keys(parseResult.data.testData || {}),
    });

    const lambdaClient = new LambdaClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });

    const functionName =
      process.env.AWS_LAMBDA_FUNCTION_NAME || "sklearn-executor";

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(parseResult.data),
    });

    // Retry when Lambda is still initializing (cold start)
    const maxAttempts = 5;
    let attempt = 0;
    let response;
    // Simple exponential backoff: 1s, 2s, 4s, 8s, 16s
    while (attempt < maxAttempts) {
      try {
        response = await lambdaClient.send(command);
        break;
      } catch (e: any) {
        const msg = String(e?.message || "");
        const initializing =
          msg.includes("Lambda is initializing your function") ||
          e?.name === "CodeArtifactUserPendingException";
        if (initializing && attempt < maxAttempts - 1) {
          const delayMs = Math.pow(2, attempt) * 1000;
          logger.warn("Lambda cold start detected; retrying", {
            attempt: attempt + 1,
            delayMs,
            error: msg,
          });
          await new Promise((res) => setTimeout(res, delayMs));
          attempt += 1;
          continue;
        }
        // Non-retryable or max attempts reached
        throw e;
      }
    }

    if (response.FunctionError) {
      const errBody = {
        success: false,
        error: "Lambda function execution failed",
        error_type: response.FunctionError,
      };
      logger.error(
        "AWS Lambda returned function error",
        errBody as Record<string, unknown>
      );
      return { status: 200, body: errBody };
    }

    if (!response.Payload) {
      throw new Error("No response payload from Lambda");
    }

    const payloadString = new TextDecoder().decode(response.Payload);
    const lambdaResult = JSON.parse(payloadString);
    const body =
      typeof lambdaResult.body === "string"
        ? JSON.parse(lambdaResult.body)
        : lambdaResult.body;
    const result = body as z.infer<typeof PythonExecutionResultSchema>;

    logger.info("AWS Lambda invocation completed", {
      success: result.success,
      hasResult: !!result.result,
      hasError: !!result.error,
    });

    return { status: 200, body: result };
  } catch (error: any) {
    logger.error("ML predict handler failed", {
      error: error.message,
      stack: error.stack,
    });
    // If Lambda is still initializing after retries, surface a 503 with hint
    const msg = String(error?.message || "");
    if (
      msg.includes("Lambda is initializing your function") ||
      error?.name === "CodeArtifactUserPendingException"
    ) {
      return {
        status: 503,
        body: { error: "Lambda is initializing; please retry shortly" },
      };
    }
    return { status: 500, body: { error: "Internal server error" } };
  }
};

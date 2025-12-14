import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export interface PythonExecutionRequest {
  code: string;
  testData: {
    features?: number[][];
    labels?: number[];
    testFeatures?: number[][];
    [key: string]: any;
  };
}

export interface PythonExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  error_type?: string;
  traceback?: string;
  stdout?: string;
  stderr?: string;
}

const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || "us-east-1",
  // If explicit credentials are not provided, the default AWS credential chain will be used
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export async function executePythonCode(
  request: PythonExecutionRequest
): Promise<PythonExecutionResult> {
  const functionName =
    process.env.AWS_LAMBDA_FUNCTION_NAME || "sklearn-executor";

  try {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(request),
    });

    const response = await lambdaClient.send(command);

    if (response.FunctionError) {
      return {
        success: false,
        error: "Lambda function execution failed",
        error_type: response.FunctionError,
      };
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

    return body as PythonExecutionResult;
  } catch (error: any) {
    return {
      success: false,
      error: `Lambda invocation failed: ${error.message}`,
      error_type: error.code || "LambdaInvocationError",
    };
  }
}

export function isLambdaConfigured(): boolean {
  const hasRegion = !!process.env.AWS_REGION;
  const hasCredentials = !!(
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  );
  const hasFunctionName = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  return hasRegion && hasCredentials && hasFunctionName;
}

export function getLambdaConfigStatus() {
  return {
    region: process.env.AWS_REGION || "not set",
    functionName: process.env.AWS_LAMBDA_FUNCTION_NAME || "not set",
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    configured: isLambdaConfigured(),
  };
}

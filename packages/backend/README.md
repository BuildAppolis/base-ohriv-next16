# Motia Backend

## AWS Lambda Python ML Integration

- Required env vars:
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_LAMBDA_FUNCTION_NAME` (e.g., `sklearn-executor`)

- Install dependency:
  - `@aws-sdk/client-lambda`

- Endpoint:
  - POST `/ml/predict`
  - Body:
    ```json
    {
      "code": "# your Python code string",
      "testData": { "features": [[1,2]], "labels": [0] }
    }
    ```

- Response: `{ success, result?, error?, error_type? }`

- Notes:
  - Uses AWS credentials from env or default credential chain.
  - Lambda should return `{ statusCode, body }` where `body` is a JSON string.
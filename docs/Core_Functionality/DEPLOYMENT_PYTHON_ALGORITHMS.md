# Python Algorithm Execution with AWS Lambda - Complete Deployment Guide

This guide covers the complete setup for executing Python scikit-learn algorithms via AWS Lambda.

## Architecture Overview

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Next.js    │       │    tRPC      │       │ AWS Lambda   │
│  (Vercel)    │ ────> │   Router     │ ────> │  (Python)    │
│   Frontend   │       │   Backend    │       │  Container   │
└──────────────┘       └──────────────┘       └──────────────┘
       │                      │                       │
       │                      │                       │
   User edits            Validates &             Executes
   Python code          sends to Lambda         scikit-learn
```

**Why AWS Lambda?**
- ✅ Cost-effective (~$1-5/month for typical usage)
- ✅ Auto-scaling (handles concurrent requests)
- ✅ Secure isolated execution
- ✅ Full scikit-learn support
- ✅ No server maintenance required

---

## Prerequisites

### 1. AWS Account
- Sign up at https://aws.amazon.com
- Note your **AWS Account ID** (12-digit number)
- Create IAM user with programmatic access

### 2. AWS CLI
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure with your credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
```

### 3. Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

---

## Step-by-Step Deployment

### Step 1: Deploy AWS Lambda Function

Navigate to the Lambda directory:
```bash
cd aws-lambda
```

#### 1.1: Create IAM Execution Role
```bash
./setup-iam.sh YOUR_AWS_ACCOUNT_ID
```

This creates `lambda-sklearn-execution-role` with permissions for:
- CloudWatch Logs (write)
- Lambda basic execution

#### 1.2: Build and Deploy Lambda
```bash
./deploy.sh YOUR_AWS_ACCOUNT_ID us-east-1
```

This will:
1. Build Docker image with Python 3.11 + scikit-learn
2. Create ECR repository
3. Push image to AWS
4. Create/update Lambda function

**Expected time:** 5-10 minutes (first deploy)

**Verify deployment:**
```bash
aws lambda get-function \
  --function-name sklearn-executor \
  --region us-east-1
```

#### 1.3: Test Lambda Function
```bash
./test-lambda.sh
```

Expected output:
```json
{
  "statusCode": 200,
  "body": "{\"success\": true, ...}"
}
```

---

### Step 2: Configure Next.js Application

#### 2.1: Add Environment Variables

Add to `.env.local`:
```env
# AWS Lambda Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_LAMBDA_FUNCTION_NAME=sklearn-executor
```

**Where to find these values:**
- **AWS_ACCESS_KEY_ID** / **AWS_SECRET_ACCESS_KEY**: From AWS IAM console → Users → Security credentials
- **AWS_LAMBDA_FUNCTION_NAME**: `sklearn-executor` (default, or your custom name)
- **AWS_REGION**: `us-east-1` (or your chosen region)

#### 2.2: Install Dependencies

Already done during implementation:
```bash
pnpm add @aws-sdk/client-lambda
```

---

### Step 3: Test End-to-End

#### 3.1: Create Test Algorithm

1. Navigate to `/admin/algorithms`
2. Click "Create New Algorithm"
3. Fill in:
   - **Name**: Test Logistic Regression
   - **Type**: Logistic Regression
   - **Language**: Python (scikit-learn) - Runs on AWS Lambda
   - **Description**: Testing Lambda execution
4. Click "Create Algorithm"

#### 3.2: Use Visual Builder

1. In the algorithm editor, switch to "Visual Builder" mode
2. Configure features:
   - Industry Experience
   - Education Level
   - Technical Skills
   - Communication
3. Click "Generate Sample Data" button
4. Review generated training samples (10 samples) and test samples (3 samples)
5. Click "Generate Code" to see Python code

**Expected Python code:**
```python
def execute(testData):
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler
    import numpy as np

    X_train = np.array(testData.get('features', []))
    y_train = np.array(testData.get('labels', []))
    X_test = np.array(testData.get('testFeatures', []))

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)

    model = LogisticRegression(max_iter=100)
    model.fit(X_train_scaled, y_train)

    predictions = model.predict(scaler.transform(X_test)).tolist()
    probabilities = model.predict_proba(scaler.transform(X_test))[:, 1].tolist()

    return {
        'success': True,
        'predictions': predictions,
        'probabilities': probabilities,
        'train_accuracy': float(model.score(X_train_scaled, y_train))
    }
```

#### 3.3: Run Test

1. Click "Run Test" button
2. Wait 2-5 seconds for Lambda execution
3. Check results in "Test Results" section

**Expected result:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "predictions": [1, 1, 0],
    "probabilities": [0.87, 0.92, 0.23],
    "train_accuracy": 0.90,
    "coefficients": [0.23, 0.45, ...],
    "intercept": -1.2
  }
}
```

#### 3.4: Activate Algorithm

Once testing is successful:
1. Click "Activate This Revision"
2. Algorithm is now live and can be used in production

---

## Monitoring & Troubleshooting

### Check Lambda Logs

```bash
# View recent logs
aws logs tail /aws/lambda/sklearn-executor --follow

# View specific time range
aws logs filter-log-events \
  --log-group-name /aws/lambda/sklearn-executor \
  --start-time $(date -d '1 hour ago' +%s)000
```

### Check Lambda Metrics

```bash
# Invocations in last hour
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=sklearn-executor \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

### Common Issues

#### Issue: "AWS Lambda is not configured"
**Solution:**
- Check `.env.local` has all AWS variables
- Restart Next.js dev server: `pnpm dev`

#### Issue: Lambda timeout
**Solution:**
```bash
# Increase timeout to 10 minutes
aws lambda update-function-configuration \
  --function-name sklearn-executor \
  --timeout 600
```

#### Issue: Out of memory
**Solution:**
```bash
# Increase memory to 3GB
aws lambda update-function-configuration \
  --function-name sklearn-executor \
  --memory-size 3008
```

#### Issue: "No module named 'sklearn'"
**Solution:**
- Redeploy Lambda: `cd aws-lambda && ./deploy.sh YOUR_ACCOUNT_ID us-east-1`

---

## Cost Breakdown

### Monthly Cost Estimate

**Light usage** (1,000 algorithm tests/month):
- Requests: 1,000 × $0.20/1M = $0.0002
- Compute: 1,000 × 5s × 2GB × $0.0000166667 = $0.17
- **Total: ~$0.20/month**

**Medium usage** (10,000 tests/month):
- **Total: ~$2.00/month**

**Heavy usage** (100,000 tests/month):
- **Total: ~$20.00/month**

**AWS Free Tier** (first 12 months):
- 1M requests/month free
- 400,000 GB-seconds compute free
- Effectively free for light/medium usage

---

## Security Best Practices

### Lambda Function Security

✅ **Enabled:**
- Isolated execution environment per invocation
- Sandboxed Python execution (no filesystem access)
- Input validation (blocks dangerous imports)
- Output sanitization (JSON-safe types only)
- CloudWatch logging for audit trail

✅ **Recommended:**
- Rotate AWS credentials every 90 days
- Use IAM roles with minimal permissions
- Enable AWS CloudTrail for API auditing
- Set up CloudWatch alarms for unusual activity

### Environment Variables

⚠️ **Never commit:**
- `.env.local` (contains secrets)
- AWS credentials

✅ **Safe to commit:**
- `.env.example` (template only)
- Lambda code (no secrets)

---

## Scaling Considerations

### Current Setup (Good for < 100,000 tests/month)
- Lambda: 2GB memory, 5min timeout
- No VPC (faster cold starts)
- Single region (us-east-1)

### If You Need More (> 100,000 tests/month)
- Increase Lambda memory: 3-10GB
- Add reserved concurrency
- Deploy to multiple regions
- Consider Fargate for always-on workloads

---

## Updating the Lambda Function

### Update Python Code

1. Edit `aws-lambda/lambda_handler.py`
2. Redeploy:
   ```bash
   cd aws-lambda
   ./deploy.sh YOUR_ACCOUNT_ID us-east-1
   ```

### Add Python Packages

1. Edit `aws-lambda/requirements.txt`:
   ```
   scikit-learn==1.3.2
   your-new-package==1.0.0
   ```
2. Redeploy (rebuilds Docker image)

### Update Lambda Configuration

```bash
# Increase timeout
aws lambda update-function-configuration \
  --function-name sklearn-executor \
  --timeout 600

# Increase memory
aws lambda update-function-configuration \
  --function-name sklearn-executor \
  --memory-size 4096
```

---

## Next Steps

1. ✅ Deploy Lambda function
2. ✅ Configure environment variables
3. ✅ Test with sample algorithm
4. 🎯 Create your first production algorithm
5. 🎯 Set up CloudWatch alarms
6. 🎯 Review costs after first month

---

## Support

### Documentation
- AWS Lambda: https://docs.aws.amazon.com/lambda/
- scikit-learn: https://scikit-learn.org/stable/
- AWS SDK: https://docs.aws.amazon.com/sdk-for-javascript/

### Troubleshooting
- Check `aws-lambda/README.md` for detailed Lambda docs
- Review CloudWatch logs for execution errors
- Test Lambda directly with `./test-lambda.sh`

---

## Summary

You now have a production-ready Python algorithm execution system:

✅ **Python scikit-learn** algorithms run on AWS Lambda
✅ **Visual builder** generates Python code automatically
✅ **Secure execution** with input validation and sandboxing
✅ **Cost-effective** (~$1-5/month for typical usage)
✅ **Scalable** auto-scaling up to 1000 concurrent executions
✅ **No maintenance** fully managed by AWS

The system is ready for production use!

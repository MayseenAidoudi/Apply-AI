import boto3
import json
import os

bedrock = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
status_table = dynamodb.Table(os.environ['STATUS_TABLE_NAME'])

def query_bedrock(job_data):
    # ... (keep the existing Bedrock querying logic)
    pass

def lambda_handler(event, context):
    job_id = event['jobId']
    
    try:
        # Get job data from DynamoDB
        response = status_table.get_item(Key={'jobId': job_id})
        job_data = json.loads(response['Item']['jobData'])
        
        insights = query_bedrock(job_data)
        
        # Update status to 'COMPLETED' with insights
        status_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET #s = :s, #i = :i',
            ExpressionAttributeNames={'#s': 'status', '#i': 'insights'},
            ExpressionAttributeValues={':s': 'COMPLETED', ':i': insights}
        )
        
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Processing completed"})
        }
    except Exception as e:
        # Update status to 'FAILED'
        status_table.update_item(
            Key={'jobId': job_id},
            UpdateExpression='SET #s = :s, #e = :e',
            ExpressionAttributeNames={'#s': 'status', '#e': 'error'},
            ExpressionAttributeValues={':s': 'FAILED', ':e': str(e)}
        )
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
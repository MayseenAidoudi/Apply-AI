import boto3
import json
import os

dynamodb = boto3.resource('dynamodb')
status_table = dynamodb.Table(os.environ['STATUS_TABLE_NAME'])

def lambda_handler(event, context):
    job_id = event['queryStringParameters']['jobId']
    
    try:
        response = status_table.get_item(Key={'jobId': job_id})
        item = response.get('Item', {})
        
        if not item:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Job not found"})
            }
        
        status = item['status']
        result = {
            "jobId": job_id,
            "status": status,
            "url": item.get('url')
        }
        
        if status == 'COMPLETED':
            result['result'] = item.get('result')
        elif status == 'FAILED':
            result['error'] = item.get('error')
        
        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
FROM public.ecr.aws/lambda/python:3.9

# Install zip utility
RUN yum install -y zip

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt -t /opt/python

# Create zip file
RUN cd /opt && zip -r9 /tmp/layer.zip python

# Set the entrypoint to copy the zip file to the mounted volume
ENTRYPOINT ["/bin/sh", "-c", "cp /tmp/layer.zip /asset-output/ && echo 'Lambda layer created successfully'"]
FROM amazonlinux:2023

# Install Python
RUN yum install -y python3 && \
    yum install -y python3-pip && \
    yum install -y zip && \
    yum clean all

# Set up PIP and Venv
RUN python3 -m venv base
RUN source base/bin/activate

# Install dependencies
COPY ./requirements.txt .
RUN pip install -r requirements.txt -t ./python

# Zip it up for deployment.
RUN zip -r layer.zip ./python/
ENTRYPOINT ["/bin/bash", "-l"]
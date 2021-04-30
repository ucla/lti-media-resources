#!/bin/bash

usage() { echo "Usage: $0 --id=<AWS_ACCOUNT_ID> --env=<PROD|STAGE|TEST>" 1>&2; exit 1; }

for i in "$@"
do
case $i in
    --id=*)
    AWS_ACCOUNT_ID="${i#*=}"
    shift
    ;;
    --env=*)
    ENV="${i#*=}"
    if [[ ! $ENV =~ ^(PROD|STAGE|TEST)$ ]]; then
      usage
    fi
    shift
    ;;
    *)
      # unknown option
      usage
    ;;
esac
done
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com
docker-compose build
docker-compose push
if [[ $ENV == PROD ]]; then
  echo "Deploying to PROD"
  aws ecs update-service --cluster lti-cluster --service lti-media-resources-prod --force-new-deployment
elif [[ $ENV == STAGE ]]; then
  echo "Deploying to STAGE"
  aws ecs update-service --cluster lti-cluster --service lti-media-resources-stage --force-new-deployment
elif [[ $ENV == TEST ]]; then
  echo "Deploying to TEST"
  aws ecs update-service --cluster lti-cluster --service lti-media-resources-test --force-new-deployment
fi
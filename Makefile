APP=AdminPortal
FILENAME=adminportal
DEPLOY=~/deployment/${FILENAME}.zip
DEST=/usr/share/nginx/html/psa-portal-eservices/
VERSION=1.0.0
NEXUS=103.224.165.232:8081
NEXUSLOGIN=appuser:mggsoftware1234!
NEXUSRELEASEUAT=http://${NEXUS}/service/rest/v1/search?repository=maven-releases&group=cdasctruat&name=${FILENAME}&sort=version
PDTURL=http://${NEXUS}/repository/maven-releases/cdasctr/${FILENAME}/${VERSION}/${FILENAME}-${VERSION}.zip
UATURL=http://${NEXUS}/repository/maven-releases/cdasctruat/${FILENAME}/${VERSION}-uat/${FILENAME}-${VERSION}-uat.zip
TMPBACKUP=/tmp/dist/
TMPSPA=~/deployment/dist/spa

# uppdt: install runpdt

# down: stop

# runpdt:
# 	@echo "running production with nginx - ${APP}"
# 	@service nginx start

# stop:
# 	@echo "stopping - ${APP}"
# 	@service nginx stop

runtest:
	@echo "Running linting and unit tests..."
	# @yarn test

install:
	@echo "yarn install for ${APP}"
	@yarn install

# UAT Deployment

build-uat:
	${eval LAST_RELEASE := ${shell curl -s -u ${NEXUSLOGIN} -X GET '${NEXUSRELEASEUAT}' | grep version | sort -V | tail -n1 | tr -d '"version" : ",' | head -n 1 | awk -F. -v OFS=. '{$$NF++;print;exit}'}}
	${eval CURRENT_RELEASE := ${shell echo "${VERSION}" | sed -e "s/release.*\///g" | sed -e "s/devel.*//g"}}
	${eval UATVERSION := ${shell echo -e "${LAST_RELEASE}\n${CURRENT_RELEASE}.0" | sort -Vr | awk '{print $1;exit}'}}

	@echo "Build ${UATVERSION} for UAT deployment"

	@sed -i s/CI_VERSION/${UATVERSION}/g package.json
	@yarn
	@quasar build -m spa
	@zip -r ${FILENAME}-${UATVERSION}-uat.zip dist/spa
	@echo "Upload zip file into nexus"
	@curl -v -u ${NEXUSLOGIN} --upload-file ${FILENAME}-${UATVERSION}-uat.zip http://${NEXUS}/repository/maven-releases/cdasctruat/${FILENAME}/${UATVERSION}-uat/${FILENAME}-${UATVERSION}-uat.zip
	@echo "Finishing build UAT"
	@rm ${FILENAME}-${UATVERSION}-uat.zip

deploy-uat:
	@echo "Start download ${VERSION} for UAT deployment"

	@mkdir -p ~/deployment
	@if [ -d ${TMPBACKUP} ]; then \
    	rm -rf ${TMPBACKUP}; \
	fi
	@if [ -f ${DEPLOY} ]; then \
		rm ${DEPLOY}; \
	fi
	@if [ -d ${TMPSPA} ]; then \
		rm -rf ${TMPSPA}; \
	fi
	@curl -u ${NEXUSLOGIN} -X GET ${UATURL} --output ${DEPLOY}
	@unzip -o ${DEPLOY} -d ~/deployment/
	@mkdir -p ${TMPBACKUP}
	@mv ${DEST}* ${TMPBACKUP}
	@cp -r ${TMPSPA}/* ${DEST}
	@echo "Finish deployment"

# Prod Deployment

build:
	@echo "Build ${VERSION} for Production deployment"

	@sed -i s/CI_VERSION/${VERSION}/g package.json
	@yarn
	@export BUILD=PROD; quasar build -m spa
	@zip -r ${FILENAME}-${VERSION}.zip dist/spa
	@echo "Upload zip file into nexus"
	@curl -v -u ${NEXUSLOGIN} --upload-file ${FILENAME}-${VERSION}.zip ${PDTURL}
	@echo "Finishing build UAT"
	@rm ${FILENAME}-${VERSION}.zip

deploy:
	@echo "Start download ${VERSION} for deployment"

	@mkdir -p ~/deployment
	@if [ -d ${TMPBACKUP} ]; then \
		rm -rf ${TMPBACKUP}; \
	fi
	@if [ -f ${DEPLOY} ]; then \
		rm ${DEPLOY}; \
	fi
	@if [ -d ${TMPSPA} ]; then \
		rm -rf ${TMPSPA}; \
	fi
	@curl -u ${NEXUSLOGIN} -X GET ${PDTURL} --output ${DEPLOY}
	@unzip -o ${DEPLOY} -d ~/deployment/
	@mkdir -p ${TMPBACKUP}
	@mv ${DEST}* ${TMPBACKUP}
	@cp -r ${TMPSPA}/* ${DEST}
	@echo "Finish deployment"

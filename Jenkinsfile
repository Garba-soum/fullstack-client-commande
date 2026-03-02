pipeline {
  agent any
  options { timestamps() }

  environment {
    BACKEND_DIR  = "backend"
    ANGULAR_DIR  = "frontend"
    REACT_DIR    = "frontendReact"

    IMG_BACKEND  = "fullstack-backend"
    IMG_ANGULAR  = "fullstack-frontend-angular"
    IMG_REACT    = "fullstack-frontend-react"

    DOCKERHUB_USER = "soumaina1u"

    // AWS (à adapter)
    AWS_IP = "51.44.11.142"
    AWS_USER = "ubuntu"
  }

  stages {

    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Backend -- Tests + Package') {
      steps {
        dir("${env.BACKEND_DIR}") {
          sh 'chmod +x mvnw || true'
          sh './mvnw -v'
          sh './mvnw -ntp clean test package'
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: "${env.BACKEND_DIR}/target/surefire-reports/*.xml"
        }
        success {
          archiveArtifacts artifacts: "${env.BACKEND_DIR}/target/*.jar", fingerprint: true, onlyIfSuccessful: true
        }
      }
    }

    stage('Frontend React - Build (Node Docker)') {
      steps {
        dir("${env.REACT_DIR}") {
          sh '''
            set -e
            echo "Workspace React:"; pwd; ls -la
            test -f package.json || (echo "package.json introuvable (React)" && exit 2)

            CID=$(docker create node:20-alpine sh -lc '
              set -e
              cd /app
              node -v
              npm -v
              if [ -f package-lock.json ]; then npm ci; else npm install; fi
              npm run build
            ')

            docker cp . "$CID":/app
            docker start -a "$CID"

            rm -rf dist
            docker cp "$CID":/app/dist ./dist
            docker rm "$CID"
          '''
        }
      }
      post {
        success {
          archiveArtifacts artifacts: "${env.REACT_DIR}/dist/**", fingerprint: true, onlyIfSuccessful: true
        }
      }
    }

    stage('Frontend Angular - Build (Node Docker)') {
      steps {
        dir("${env.ANGULAR_DIR}") {
          sh '''
            set -e
            echo "Workspace Angular:"; pwd; ls -la
            test -f package.json || (echo "package.json introuvable (Angular)" && exit 2)

            CID=$(docker create node:20-alpine sh -lc '
              set -e
              cd /app
              node -v
              npm -v
              if [ -f package-lock.json ]; then npm ci; else npm install; fi
              npm run build
            ')

            docker cp . "$CID":/app
            docker start -a "$CID"

            rm -rf dist
            docker cp "$CID":/app/dist ./dist
            docker rm "$CID"
          '''
        }
      }
      post {
        success {
          archiveArtifacts artifacts: "${env.ANGULAR_DIR}/dist/**", fingerprint: true, onlyIfSuccessful: true
        }
      }
    }

    stage('Docker - Build 3 images') {
      steps {
        sh 'docker version'
        sh "docker build -t ${env.IMG_BACKEND}:${env.BUILD_NUMBER}  ${env.BACKEND_DIR}"
        sh "docker build -t ${env.IMG_REACT}:${env.BUILD_NUMBER}    ${env.REACT_DIR}"
        sh "docker build -t ${env.IMG_ANGULAR}:${env.BUILD_NUMBER}  ${env.ANGULAR_DIR}"

        // tag latest (pratique pour le déploiement)
        sh "docker tag ${env.IMG_BACKEND}:${env.BUILD_NUMBER}  ${env.IMG_BACKEND}:latest"
        sh "docker tag ${env.IMG_REACT}:${env.BUILD_NUMBER}    ${env.IMG_REACT}:latest"
        sh "docker tag ${env.IMG_ANGULAR}:${env.BUILD_NUMBER}  ${env.IMG_ANGULAR}:latest"

        sh "docker images | head -n 30"
      }
    }

    stage('Docker - Push 3 images') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh '''
            set -e
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin

            for img in fullstack-backend fullstack-frontend-react fullstack-frontend-angular; do
              docker tag $img:${BUILD_NUMBER} ${DOCKERHUB_USER}/$img:${BUILD_NUMBER}
              docker tag $img:latest         ${DOCKERHUB_USER}/$img:latest

              docker push ${DOCKERHUB_USER}/$img:${BUILD_NUMBER}
              docker push ${DOCKERHUB_USER}/$img:latest
            done

            docker logout
          '''
        }
      }
    }

    stage('Deploy AWS (docker compose)') {
      steps {
        sshagent(['aws-ssh-key']) {
          sh """
            set -e
            scp -o StrictHostKeyChecking=no docker-compose.prod.yml ${AWS_USER}@${AWS_IP}:/home/${AWS_USER}/

            ssh -o StrictHostKeyChecking=no ${AWS_USER}@${AWS_IP} '
              set -e
              cd /home/${AWS_USER}

              # login dockerhub si tes images sont privées (sinon inutile)
              # docker login -u ${DOCKERHUB_USER} -p XXX

              docker compose -f docker-compose.prod.yml pull || docker-compose -f docker-compose.prod.yml pull
              docker compose -f docker-compose.prod.yml down || docker-compose -f docker-compose.prod.yml down
              docker compose -f docker-compose.prod.yml up -d || docker-compose -f docker-compose.prod.yml up -d

              docker ps
            '
          """
        }
      }
    }
  }

  post {
    success { echo "✅ OK : build + push + deploy AWS" }
    failure { echo "❌ KO : regarde la stage en erreur" }
  }
}
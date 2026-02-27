pipeline {
  agent any

  options { timestamps() }

  environment {
    BACKEND_DIR  = "backend"
    ANGULAR_DIR  = "frontend"
    REACT_DIR    = "frontendReact"

    // NOMS D'IMAGES (locales)
    IMG_BACKEND  = "fullstack-backend"
    IMG_ANGULAR  = "fullstack-frontend-angular"
    IMG_REACT    = "fullstack-frontend-react"

    // Docker Hub
    DOCKERHUB_USER = "soumaina1u"
  }

  stages {

    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Backend - Tests + Package') {
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

            echo "Workspace React:"
            pwd
            ls -la
            test -f package.json || (echo "package.json introuvable (React)" && exit 2)

            CID=$(docker create node:20-alpine sh -lc '
              set -e
              cd /app
              node -v
              npm -v
              if [ -f package-lock.json ]; then npm ci; else npm install; fi
              npm run build
            ')

            echo "Container React: $CID"

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

            echo "Workspace Angular:"
            pwd
            ls -la
            test -f package.json || (echo "package.json introuvable (Angular)" && exit 2)

            CID=$(docker create node:20-alpine sh -lc '
              set -e
              cd /app
              node -v
              npm -v
              if [ -f package-lock.json ]; then npm ci; else npm install; fi
              npm run build
            ')

            echo "Container Angular: $CID"

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
        sh "docker images | head -n 30"
      }
    }

    stage('Docker - Push 3 images') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh """
            set -e
            echo "\$DH_PASS" | docker login -u "\$DH_USER" --password-stdin

            docker tag ${IMG_BACKEND}:${BUILD_NUMBER} ${DOCKERHUB_USER}/${IMG_BACKEND}:${BUILD_NUMBER}
            docker tag ${IMG_REACT}:${BUILD_NUMBER}   ${DOCKERHUB_USER}/${IMG_REACT}:${BUILD_NUMBER}
            docker tag ${IMG_ANGULAR}:${BUILD_NUMBER} ${DOCKERHUB_USER}/${IMG_ANGULAR}:${BUILD_NUMBER}

            docker push ${DOCKERHUB_USER}/${IMG_BACKEND}:${BUILD_NUMBER}
            docker push ${DOCKERHUB_USER}/${IMG_REACT}:${BUILD_NUMBER}
            docker push ${DOCKERHUB_USER}/${IMG_ANGULAR}:${BUILD_NUMBER}

            docker logout
          """
        }
      }
    }

  }

  post {
    success { echo "✅ Palier 2 OK : tests + build React/Angular + build/push 3 images Docker" }
    failure { echo "❌ Palier 2 KO : regarde la stage en erreur" }
  }
}
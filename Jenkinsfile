pipeline {
  agent any

  options {
    timestamps()
    skipDefaultCheckout(true)
  }

  environment {
    BACKEND_DIR  = "backend"
    FRONTEND_DIR = "frontendReact"

    // 🔁 Mets ton username DockerHub ici
    DOCKERHUB_USER = "TON_USERNAME_DOCKERHUB"

    // Noms images (repo DockerHub)
    BACKEND_IMAGE  = "${DOCKERHUB_USER}/client-commande-backend"
    FRONTEND_IMAGE = "${DOCKERHUB_USER}/client-commande-frontend"

    // Tag simple : build number Jenkins
    IMAGE_TAG = "${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('CI - Backend (tests + jar)') {
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

    stage('CI - Frontend (install + build)') {
      steps {
        dir("${env.FRONTEND_DIR}") {
          sh 'node -v'
          sh 'npm -v'
          sh 'npm ci'
          sh 'npm run build'
        }
      }
      post {
        success {
          archiveArtifacts artifacts: "${env.FRONTEND_DIR}/dist/**", fingerprint: true, onlyIfSuccessful: true
        }
      }
    }

    stage('Docker - Check') {
  steps {
    sh 'whoami'
    sh 'pwd'
    sh 'echo $PATH'
    sh 'which docker || true'
    sh 'ls -l /usr/bin/docker || true'
    sh 'ls -l /usr/local/bin/docker || true'
    sh 'docker version'
  }
}

    stage('Docker - Build Images') {
      steps {
        sh """
          docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG}  ${BACKEND_DIR}
          docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_DIR}

          # Tag latest en plus (pratique)
          docker tag ${BACKEND_IMAGE}:${IMAGE_TAG}  ${BACKEND_IMAGE}:latest
          docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
        """
      }
    }

    stage('DockerHub - Login & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh """
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
            docker push ${BACKEND_IMAGE}:latest
            docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
            docker push ${FRONTEND_IMAGE}:latest
            docker logout
          """
        }
      }
    }
  }

  post {
    success { echo "✅ Palier 2 OK : images buildées & push sur DockerHub" }
    failure { echo "❌ Palier 2 KO : regarde la stage en erreur" }
  }
}
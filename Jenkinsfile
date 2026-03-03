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

    AWS_IP   = "13.39.25.201"
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
            test -f package.json || (echo "package.json introuvable (React)" && exit 2)

            CID=$(docker create node:20-alpine sh -lc '
              set -e
              cd /app
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
    }

    stage('Frontend Angular - Build (Node Docker)') {
      steps {
        dir("${env.ANGULAR_DIR}") {
          sh '''
            set -e
            test -f package.json || (echo "package.json introuvable (Angular)" && exit 2)

            CID=$(docker create node:20-alpine sh -lc '
              set -e
              cd /app
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
    }

    stage('Docker - Build 3 images') {
      steps {
        sh "docker build -t ${env.IMG_BACKEND}:${env.BUILD_NUMBER}  ${env.BACKEND_DIR}"
        sh "docker build -t ${env.IMG_REACT}:${env.BUILD_NUMBER}    ${env.REACT_DIR}"
        sh "docker build -t ${env.IMG_ANGULAR}:${env.BUILD_NUMBER}  ${env.ANGULAR_DIR}"

        sh "docker tag ${env.IMG_BACKEND}:${env.BUILD_NUMBER}  ${env.IMG_BACKEND}:latest"
        sh "docker tag ${env.IMG_REACT}:${env.BUILD_NUMBER}    ${env.IMG_REACT}:latest"
        sh "docker tag ${env.IMG_ANGULAR}:${env.BUILD_NUMBER}  ${env.IMG_ANGULAR}:latest"
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

        test -f docker-compose.prod.yml || (echo "❌ docker-compose.prod.yml introuvable" && exit 2)
        test -f .env.prod || (echo "❌ .env.prod introuvable" && exit 2)
        test -d db || (echo "❌ dossier db/ introuvable" && exit 2)

        echo "=== Prepare /home/${AWS_USER}/db with correct permissions ==="
        ssh -o StrictHostKeyChecking=no ${AWS_USER}@${AWS_IP} "sudo rm -rf /home/${AWS_USER}/db && sudo mkdir -p /home/${AWS_USER}/db && sudo chown -R ${AWS_USER}:${AWS_USER} /home/${AWS_USER}/db"

        echo "=== Copy files to AWS ==="
        scp -o StrictHostKeyChecking=no docker-compose.prod.yml ${AWS_USER}@${AWS_IP}:/home/${AWS_USER}/
        scp -o StrictHostKeyChecking=no .env.prod ${AWS_USER}@${AWS_IP}:/home/${AWS_USER}/
        scp -o StrictHostKeyChecking=no -r db ${AWS_USER}@${AWS_IP}:/home/${AWS_USER}/

        echo "=== Deploy on AWS ==="
        ssh -o StrictHostKeyChecking=no ${AWS_USER}@${AWS_IP} 'bash -s' <<'EOF'
          set -e
          cd /home/ubuntu

          echo "=== Detect docker compose ==="
          if docker compose version >/dev/null 2>&1; then
            DC="docker compose"
          elif command -v docker-compose >/dev/null 2>&1; then
            DC="docker-compose"
          else
            echo "❌ docker compose not installed on server"
            echo "👉 Install one time manually on the server, then rerun Jenkins"
            exit 1
          fi
          echo "Using: \$DC"

          echo "=== Pull images ==="
          $DC -f docker-compose.prod.yml --env-file .env.prod pull

          echo "=== Restart stack ==="
          $DC -f docker-compose.prod.yml --env-file .env.prod down || true
          $DC -f docker-compose.prod.yml --env-file .env.prod up -d

          echo "=== Status ==="
          $DC -f docker-compose.prod.yml --env-file .env.prod ps || true
          docker ps

          echo "=== Logs ==="
          docker logs --tail 120 app-mssql || true
          docker logs --tail 200 app-backend || true
EOF
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
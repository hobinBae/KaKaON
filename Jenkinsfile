pipeline {
    agent any

    environment {
        // 컨테이너 및 이미지 이름 설정
        BE_IMAGE = "kakaon-be-image"
        BE_CONTAINER = "be-kakaon"
        FE_IMAGE = "kakaon-fe-image"
        FE_CONTAINER = "fe-kakaon"

        // Jenkins Credentials ID 매핑
        ROOT_ENV_ID = 'KAKAON_ENV_FILE'
        BE_ENV_ID   = 'KAKAON_BE_ENV_FILE'
        BE_PROP_ID  = 'KAKAON_BE_APPLICATION_PROPERTIES'
        FE_ENV_ID   = 'KAKAON_FE_ENV_FILE'
    }

    stages {
        stage('Step 1: 자격 증명 파일 주입') {
            steps {
                withCredentials([
                    file(credentialsId: "${ROOT_ENV_ID}", variable: 'rootEnv'),
                    file(credentialsId: "${BE_ENV_ID}", variable: 'beEnv'),
                    file(credentialsId: "${FE_ENV_ID}", variable: 'feEnv'),
                    file(credentialsId: "${BE_PROP_ID}", variable: 'beProp')
                ]) {
                    script {
                        // 백엔드 설정 파일 경로 생성 및 복사
                        sh 'mkdir -p be-kakaon/src/main/resources'
                        sh "cp ${rootEnv} .env"
                        sh "cp ${beEnv} be-kakaon/.env"
                        sh "cp ${beProp} be-kakaon/src/main/resources/application.properties"
                        sh "cp ${feEnv} fe-kakaon/.env"
                        
                        echo "✅ application.properties 및 .env 주입 완료"
                    }
                }
            }
        }

        stage('Step 2: Backend 빌드 (Gradle)') {
            steps {
                dir('be-kakaon') {
                    sh 'chmod +x gradlew'
                    // clean을 통해 이전 빌드 잔재 삭제 후 재빌드
                    sh './gradlew clean build -x test'
                }
            }
        }

        stage('Step 3: 통합 배포 (Docker)') {
            steps {
                script {
                    // 1. 기존 컨테이너 중지 및 삭제
                    sh "docker stop ${BE_CONTAINER} ${FE_CONTAINER} || true"
                    sh "docker rm ${BE_CONTAINER} ${FE_CONTAINER} || true"
                    
                    // 2. 중요: --no-cache를 사용하여 수정된 application.properties가 확실히 반영되게 함
                    // 400 에러 해결을 위해 필수적인 단계입니다.
                    sh "docker-compose -f docker-compose-prod.yml build --no-cache"
                    
                    // 3. 컨테이너 실행
                    sh "docker-compose -f docker-compose-prod.yml up -d"
                }
            }
        }

        stage('Step 4: Health Check') {
            steps {
                script {
                    // 스프링 부트 기동 시간을 고려하여 대기 (502 에러 방지)
                    echo "서버 기동 대기 중 (20초)..."
                    sleep 20

                    def beStatus = sh(
                        script: "docker inspect --format='{{.State.Status}}' ${BE_CONTAINER}",
                        returnStdout: true
                    ).trim()

                    def feStatus = sh(
                        script: "docker inspect --format='{{.State.Status}}' ${FE_CONTAINER}",
                        returnStdout: true
                    ).trim()

                    if (beStatus == 'running' && feStatus == 'running') {
                        echo "✅ 서비스가 정상적으로 실행되었습니다!"
                    } else {
                        error "❌ 배포 실패 (BE: ${beStatus}, FE: ${feStatus})"
                    }
                }
            }
        }
    }

    post {
        always {
            // 작업 공간 정리
            cleanWs()
            // 사용하지 않는 이미지 정리 (디스크 용량 확보 및 502 예방)
            sh "docker image prune -f"
        }
        success {
            echo "Congratulations! 배포가 완료되었습니다."
        }
        failure {
            echo "배포 중 에러가 발생했습니다. 로그를 확인하세요."
        }
    }
}

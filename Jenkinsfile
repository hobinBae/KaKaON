// ===== 트리거 사용자명 계산 함수 =====
def resolveTriggeredBy = {
    def glUser = (env.gitlabUserName ?: env.gitlab_user_name ?: env.GITLAB_USER_NAME)
    if (glUser && glUser.trim()) {
        return glUser.trim()
    }
    return sh(script: "cd ${env.DEPLOY_PATH} && git log -1 --pretty=%an", returnStdout: true).trim()
}


pipeline {
    agent any
    
    environment {
        // ===== 배포 경로 =====
        DEPLOY_PATH = '/home/ubuntu/app'
        
        // ===== Git 브랜치 =====
        GIT_BRANCH = 'develop'

        // ===== 항상 배포용 compose 파일만 사용 =====
        COMPOSE_FILE = 'docker-compose-prod.yml'
    }
    
    stages {
        stage('배포 시작') {
            steps {
                script {
                    echo '================================================='
                    echo 'CI/CD 파이프라인 시작'
                    echo '================================================='
                    echo "브랜치: ${GIT_BRANCH}"
                    echo "빌드 번호: ${BUILD_NUMBER}"
                    echo "시작 시간: ${new Date()}"
                    echo "사용 Compose 파일: ${COMPOSE_FILE}"
                    echo '================================================='
                }
            }
        }
        
        stage('환경 확인') {
            steps {
                script {
                    echo '================================================='
                    echo '배포 환경 확인 중...'
                    echo '================================================='
                    
                    sh '''
                        echo "현재 디렉토리: $(pwd)"
                        echo "현재 사용자: $(whoami)"
                        echo ""
                        echo "Docker 버전:"
                        docker --version
                        echo ""
                        echo "Docker Compose 버전:"
                        docker compose version
                        echo ""
                        echo "디스크 사용량:"
                        df -h | grep -E "Filesystem|/dev/"
                    '''
                }
            }
        }
        
        stage('Git Pull') {
            steps {
                withCredentials([usernamePassword(
                credentialsId: 'gitlab-clone',
                usernameVariable: 'GIT_USER',
                passwordVariable: 'GIT_TOKEN'
                )]) {
                    echo '================================================='
                    echo '최신 코드 가져오기...'
                    echo '================================================='

                    sh """
                        cd ${DEPLOY_PATH}

                        # 워킹디렉터리 안전 등록 (루트권한/컨테이너에서 퍼미션 경고 회피)
                        git config --global --add safe.directory ${DEPLOY_PATH} || true

                        # 원격 URL에 토큰 주입 (HTTPS)
                        git remote set-url origin \
                        https://${GIT_USER}:${GIT_TOKEN}@lab.ssafy.com/s13-final/S13P31S310.git

                        
                        echo "현재 브랜치 확인..."
                        git branch -a
                        
                        echo "Git Fetch..."
                        git fetch origin
                        
                        echo "브랜치 체크아웃: ${GIT_BRANCH}"
                        git checkout ${GIT_BRANCH}
                        
                        echo "Git Pull..."
                        git pull origin ${GIT_BRANCH}
                        
                        echo "최신 코드로 업데이트 완료!"
                        echo ""
                        echo "현재 커밋 정보:"
                        git log -1 --oneline --decorate
                        echo ""
                        echo "변경된 파일:"
                        git log -1 --stat
                    """
                }
            }
        }
        
        stage('기존 컨테이너 중지') {
            steps {
                script {
                    echo '================================================='
                    echo '기존 컨테이너 중지 중...'
                    echo '================================================='
                    
                    sh """
                        cd ${DEPLOY_PATH}
                        
                        echo "현재 실행 중인 컨테이너:"
                        docker ps
                        
                        echo ""
                        echo "Docker Compose Down..."
                        docker compose -f ${COMPOSE_FILE} down || echo "실행 중인 컨테이너 없음"
                        
                        echo "컨테이너 중지 완료!"
                    """
                }
            }
        }
        
        stage('Docker 이미지 빌드') {
            steps {
                script {
                    echo '================================================='
                    echo 'Docker 이미지 빌드 중...'
                    echo '================================================='
                    
                    sh """
                        cd ${DEPLOY_PATH}
                        
                        echo "Backend 이미지 빌드..."
                        docker compose -f ${COMPOSE_FILE} build --no-cache be-kakaon
                        
                        echo ""
                        echo "Frontend 이미지 빌드..."
                        docker compose -f ${COMPOSE_FILE} build --no-cache fe-kakaon
                        
                        echo ""
                        echo "이미지 빌드 완료!"
                        echo ""
                        echo "빌드된 이미지 목록:"
                        docker images | grep -E "REPOSITORY|kakaon"
                    """
                }
            }
        }
        
        stage('컨테이너 시작') {
            steps {
                script {
                    echo '================================================='
                    echo 'Docker Compose로 컨테이너 시작...'
                    echo '================================================='
                    
                    sh """
                        cd ${DEPLOY_PATH}
                        
                        echo "Docker Compose Up..."
                        docker compose -f ${COMPOSE_FILE} up -d
                        
                        echo ""
                        echo "컨테이너 시작 대기 (15초)..."
                        sleep 15
                        
                        echo ""
                        echo "컨테이너 시작 완료!"
                        echo ""
                        echo "컨테이너 상태:"
                        docker compose -f ${COMPOSE_FILE} ps
                    """
                }
            }
        }
        
        stage(' Health Check') {
            steps {
                script {
                    echo '================================================='
                    echo '애플리케이션 헬스 체크...'
                    echo '================================================='
                    
                    sh """
                        echo "컨테이너 상태 확인..."
                        echo ""
                        
                        # Backend 체크
                        echo "==== Backend 체크 ===="
                        if docker ps | grep -q "be-kakaon.*Up"; then
                            echo "Backend 컨테이너 실행 중"
                            echo "Backend 로그 (최근 20줄):"
                            docker logs be-kakaon --tail 20
                        else
                            echo "Backend 컨테이너 실행 실패!"
                            echo "Backend 에러 로그:"
                            docker logs be-kakaon --tail 50
                            exit 1
                        fi
                        
                        echo ""
                        
                        # Frontend 체크
                        echo "==== Frontend 체크 ===="
                        if docker ps | grep -q "fe-kakaon.*Up"; then
                            echo "Frontend 컨테이너 실행 중"
                            echo "Frontend 로그 (최근 10줄):"
                            docker logs fe-kakaon --tail 10
                        else
                            echo "Frontend 컨테이너 실행 실패!"
                            echo "Frontend 에러 로그:"
                            docker logs fe-kakaon --tail 50
                            exit 1
                        fi
                        
                        echo ""
                        
                        # MySQL 체크
                        echo "==== MySQL 체크 ===="
                        if docker ps | grep -q "mysql.*Up"; then
                            MYSQL_HEALTH=\$(docker inspect --format="{{.State.Health.Status}}" mysql 2>/dev/null || echo "unknown")
                            if [ "\$MYSQL_HEALTH" = "healthy" ]; then
                                echo "MySQL 컨테이너 정상 (healthy)"
                            else
                                echo "MySQL 컨테이너 상태: \$MYSQL_HEALTH"
                            fi
                        else
                            echo "MySQL 컨테이너 실행 실패!"
                            exit 1
                        fi
                        
                        echo ""
                        
                        # Redis 체크
                        echo "==== Redis 체크 ===="
                        if docker ps | grep -q "redis.*Up"; then
                            REDIS_HEALTH=\$(docker inspect --format="{{.State.Health.Status}}" redis 2>/dev/null || echo "unknown")
                            if [ "\$REDIS_HEALTH" = "healthy" ]; then
                                echo "Redis 컨테이너 정상 (healthy)"
                            else
                                echo "Redis 컨테이너 상태: \$REDIS_HEALTH"
                            fi
                        else
                            echo "Redis 컨테이너 실행 실패!"
                            exit 1
                        fi
                    """
                    
                    echo 'Health Check 통과!'
                }
            }
        }
        
        stage('정리 작업') {
            steps {
                script {
                    echo '================================================='
                    echo '사용하지 않는 Docker 리소스 정리...'
                    echo '================================================='
                    
                    sh """
                        echo "Dangling 이미지 제거..."
                        docker image prune -f
                        
                        echo ""
                        echo "사용하지 않는 볼륨 제거..."
                        docker volume prune -f || true
                        
                        echo ""
                        echo "정리 완료!"
                        echo ""
                        echo "디스크 사용량:"
                        df -h | grep -E "Filesystem|/dev/"
                    """
                }
            }
        }
        
        stage('최종 상태 확인') {
            steps {
                script {
                    echo '================================================='
                    echo '최종 배포 상태'
                    echo '================================================='
                    
                    sh """
                        echo "==== Docker Compose 상태 ===="
                        docker compose -f ${COMPOSE_FILE} ps
                        
                        echo ""
                        echo "==== 리소스 사용량 ===="
                        docker stats --no-stream --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}"
                        
                        echo ""
                        echo "==== 포트 확인 ===="
                        sudo netstat -tulpn | grep -E "80|443|8080|3306|6379|9090" || echo "netstat not available"
                    """
                }
            }
        }
    }
    
    post {
        success {
            script {
                
                def commitMessage = sh(script: "cd ${DEPLOY_PATH} && git log -1 --pretty=%s", returnStdout: true).trim()
                def commitHash    = sh(script: "cd ${DEPLOY_PATH} && git rev-parse --short HEAD", returnStdout: true).trim()
                def triggeredBy   = resolveTriggeredBy()
                mattermostSend(
                    color: "good",
                    channel: "5to0",
                    message: """
✅ **배포 성공**
**브랜치:** ${env.GIT_BRANCH}
**커밋:** ${commitHash} — ${commitMessage}
**트리거:** ${triggeredBy}
**빌드 번호:** #${env.BUILD_NUMBER}
**걸린 시간:** ${currentBuild.durationString}
🔗 <${env.BUILD_URL}|빌드 상세보기>
""".stripIndent()
      )

                echo '===================================================='
                echo '✅배포 성공!'
                echo '===================================================='
                echo "빌드 #${BUILD_NUMBER} 배포 완료!"
                echo "브랜치: ${GIT_BRANCH}"
                echo "완료 시간: ${new Date()}"
                echo "애플리케이션 URL: https://k13s310.p.ssafy.io"
                echo '===================================================='
                echo ''
                echo '접속 정보:'
                echo "  - Frontend: https://k13s310.p.ssafy.io"
                echo "  - Backend API(프록시 경유): https://k13s310.p.ssafy.io/api"
                echo "  - Jenkins: http://k13s310.p.ssafy.io:9090"
                echo ''
                echo '유용한 명령어:'
                echo "  - 로그 확인: docker compose -f ${COMPOSE_FILE} logs -f"
                echo "  - 상태 확인: docker compose -f ${COMPOSE_FILE} ps"
                echo "  - 재시작: docker compose -f ${COMPOSE_FILE} restart"
                echo '===================================================='
            }
        }
        
        failure {
            script {
                def triggeredBy = resolveTriggeredBy()
                mattermostSend(
                    color: "danger",
                    channel: "5to0",
                    message: """
❌ **배포 실패**
**프로젝트:** ${env.JOB_NAME}
**브랜치:** ${env.GIT_BRANCH}
**트리거:** ${triggeredBy}
**빌드 번호:** #${env.BUILD_NUMBER}
**걸린 시간:** ${currentBuild.durationString}
⚠️ 로그 확인 필요.
🔗 <${env.BUILD_URL}|빌드 상세보기>
""".stripIndent()
      )

                echo '===================================================='
                echo '❌배포 실패!'
                echo '===================================================='
                echo "빌드 #${BUILD_NUMBER} 실패!"
                echo "실패 시간: ${new Date()}"
                echo ''
                echo '문제 해결 방법:'
                echo '1. Jenkins 콘솔 로그 확인'
                echo '2. 컨테이너 로그 확인: docker compose -f ${COMPOSE_FILE} logs'
                echo '3. 컨테이너 상태 확인: docker compose -f ${COMPOSE_FILE} ps -a'
                echo '===================================================='
                
                // 실패 시 로그 수집
                sh '''
                    echo "에러 로그 수집 중..."
                    echo "==== Backend 로그 ===="
                    docker logs be-kakaon --tail 100 2>&1 || true
                    echo "==== Frontend 로그 ===="
                    docker logs fe-kakaon --tail 50 2>&1 || true
                    echo "==== Compose 상태 ===="
                    docker compose -f ${COMPOSE_FILE} ps || true
                '''
            }
        }
        
        always {
            script {
                echo '===================================================='
                echo '파이프라인 종료'
                echo '===================================================='
                echo "총 소요 시간: ${currentBuild.durationString}"
                
                // Jenkins 워크스페이스 정리
                cleanWs()
            }
        }
    }
}
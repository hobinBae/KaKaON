# ./compose-smart-up.sh
#!/usr/bin/env bash
set -euo pipefail

# ============================================
# 1. 기준 커밋/브랜치 설정
#    - 인자 없으면: 현재 워킹디렉토리(unstaged + staged) vs HEAD 기준
#    - 인자 있으면: 그 ref ... HEAD 기준으로 비교 (ex: origin/develop)
# ============================================
BASE_REF="${1:-}"

if [ -n "$BASE_REF" ]; then
    echo "[INFO] 기준: ${BASE_REF} ... HEAD + 현재 로컬 변경 검사 "

    # 1) 기준 브랜치와 HEAD 사이의 커밋된 변경
    CHANGED_COMMITTED=$(git diff --name-only "${BASE_REF}"...HEAD || true)
    # 2) HEAD 기준 staged 변경
    CHANGED_CACHED=$(git diff --name-only --cached || true)
    # 3) HEAD 기준 unstaged 변경 (tracked)
    CHANGED_WORKTREE=$(git diff --name-only || true)
    # 4) untracked 파일 (새로 만든 파일들)
    CHANGED_UNTRACKED=$(git ls-files --others --exclude-standard || true)

    CHANGED_FILES=$(
        printf "%s\n%s\n%s\n%s\n" \
            "$CHANGED_COMMITTED" \
            "$CHANGED_CACHED" \
            "$CHANGED_WORKTREE" \
            "$CHANGED_UNTRACKED" \
        | sed '/^$/d' | sort -u
    )
else
    echo "[INFO] 기준: HEAD + 현재 워킹 디렉토리 변경 검사"
    CHANGED_CACHED=$(git diff --name-only --cached || true)
    CHANGED_WORKTREE=$(git diff --name-only || true)
    CHANGED_UNTRACKED=$(git ls-files --others --exclude-standard || true)

    CHANGED_FILES=$(
        printf "%s\n%s\n%s\n" \
            "$CHANGED_CACHED" \
            "$CHANGED_WORKTREE" \
            "$CHANGED_UNTRACKED" \
        | sed '/^$/d' | sort -u
    )
fi



echo "[DEBUG] 변경된 파일 목록"
if [ -z "$CHANGED_FILES" ]; then
    echo "(없음) "
else
    echo "$CHANGED_FILES"
fi

# ============================================
# 2. 어떤 서비스가 영향을 받는지 판단 
# ============================================
NEED_BE=false
NEED_FE=false

# BE 디렉토리 변경 있으면 BE 타겟 
if echo "$CHANGED_FILES" | grep -q '^be-kakaon/'; then
    NEED_BE=true
fi

# FE 디렉토리 변경 있으면 FE 타겟 
if echo "$CHANGED_FILES" | grep -q '^fe-kakaon/'; then
    NEED_FE=true
fi

# 공용 인프라 변경되면 둘 다 다시 빌드하게 
if echo "$CHANGED_FILES" | grep -qE '^docker-compose\.yml$|^docker-compose-.*\.yml$|^\.env$'; then
    NEED_BE=true
    NEED_FE=true
fi

echo "[INFO] 판정 결과 → NEED_BE=${NEED_BE}, NEED_FE=${NEED_FE}"

# ============================================
# 3. 변경이 아예 없을 때 처리 
# ============================================
if [ -z "$CHANGED_FILES" ]; then
    echo "[INFO] 코드 변경 없음 → docker compose up -d 만 실행할게요"
    docker compose up -d
    exit 0
fi

# BE/FE 둘 다 안 건드리고 README 같은 것만 수정했을 때 
if [ "$NEED_BE" = false ] && [ "$NEED_FE" = false ]; then
    echo "[INFO] BE/FE 관련 변경 없음 → docker compose up -d 만 실행할게요"
    docker compose up -d
    exit 0
fi

# ============================================
# 4. 실제 빌드/업 수행 
# ============================================
if [ "$NEED_BE" = true ]; then
    echo "[INFO] BE 변경 감지 → be-kakaon만 빌드/업 할게요"
    docker compose up -d --build --force-recreate --no-deps be-kakaon
fi

if [ "$NEED_FE" = true ]; then
    echo "[INFO] FE 변경 감지 → fe-kakaon만 빌드/업 할게요"
    docker compose up -d --build --force-recreate --no-deps fe-kakaon
fi
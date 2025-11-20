package com.s310.kakaon.global.jwt;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@Slf4j
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final String BLACKLIST_PREFIX = "blacklist:";

    private final StringRedisTemplate stringRedisTemplate;

    public void addToBlackList(String token, Duration duration) {
        String key = BLACKLIST_PREFIX + token;
        stringRedisTemplate.opsForValue().set(key, "blacklisted", duration);
        log.debug("Token added to blacklist with TTL : {} seconds", duration.getSeconds());
    }

    public boolean isBlackListed(String token) {
        String key = BLACKLIST_PREFIX + token;
        return stringRedisTemplate.hasKey(key);
    }

}

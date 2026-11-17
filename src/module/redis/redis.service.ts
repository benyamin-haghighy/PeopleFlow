
import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private redis: Redis;

    async onModuleInit() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        });

        this.redis.on('connect', () => {
            this.logger.log('Redis connected');
        });

        this.redis.on('error', (error) => {
            this.logger.error(`Redis error: ${error.message}`);
        });

        await this.redis.ping();
    }
    async getOrThrow(key: string): Promise<string> {
        const value = await this.redis.get(key);

        if (value === null) {
            throw new NotFoundException('مقدار مورد نظر منقضی شده یا وجود ندارد');
        }

        return value;
    }
    async onModuleDestroy() {
        await this.redis.quit();
    }
    async getRemainingTime(key: string): Promise<string> {
        const ttl = await this.redis.ttl(key);

        if (ttl === -2) {
            throw new NotFoundException('کلید وجود ندارد یا منقضی شده است');
        }

        if (ttl === -1) {
            throw new BadRequestException('برای این کلید زمان انقضا تعیین نشده است');
        }

        const minutes = Math.floor(ttl / 60);
        const seconds = ttl % 60;

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // SET
    async set(key: string, value: string | number, ttl?: number) {
        if (ttl !== undefined) {
            return this.redis.set(key, String(value), 'EX', ttl);
        }

        return this.redis.set(key, String(value));
    }

    // GET
    async get(key: string) {
        return this.redis.get(key);
    }

    // SET JSON
    async setJson(key: string, value: unknown, ttl?: number) {
        const data = JSON.stringify(value);

        if (data === undefined) {
            throw new Error('Value cannot be converted to JSON');
        }

        return this.set(key, data, ttl);
    }

    // GET JSON
    async getJson<T>(key: string): Promise<T | null> {
        const data = await this.get(key);

        if (data === null) {
            return null;
        }

        return JSON.parse(data) as T;
    }

    // DELETE
    async del(key: string) {
        return this.redis.del(key);
    }

    // EXISTS
    async exists(key: string): Promise<boolean> {
        return (await this.redis.exists(key)) === 1;
    }

    // EXPIRE (Seconds)
    async expire(key: string, seconds: number) {
        return this.redis.expire(key, seconds);
    }

    // PEXPIRE (Milliseconds)
    async pexpire(key: string, milliseconds: number) {
        return this.redis.pexpire(key, milliseconds);
    }

    // TTL (Seconds)
    async ttl(key: string) {
        return this.redis.ttl(key);
    }

    // PTTL (Milliseconds)
    async pttl(key: string) {
        return this.redis.pttl(key);
    }

    // PERSIST (Remove expiration)
    async persist(key: string) {
        return this.redis.persist(key);
    }

    // INCREMENT
    async incr(key: string) {
        return this.redis.incr(key);
    }

    // DECREMENT
    async decr(key: string) {
        return this.redis.decr(key);
    }

    // INCREMENT BY
    async incrBy(key: string, amount: number) {
        return this.redis.incrby(key, amount);
    }

    // DECREMENT BY
    async decrBy(key: string, amount: number) {
        return this.redis.decrby(key, amount);
    }
}

import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { DatabaseHealthIndicator } from '../service/database/database.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: DatabaseHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.isHealthy('database'),
      // Memory check: the heap shouldn't exceed 150MB (adjust as needed)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // RSS memory check: the process shouldn't exceed 300MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }
}

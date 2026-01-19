import { Injectable } from '@nestjs/common';
import { BrevoService } from './brevo.service';

@Injectable()
export class NodemailerService extends BrevoService {}

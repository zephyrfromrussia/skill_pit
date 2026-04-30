import { Injectable } from '@nestjs/common';
import path from 'node:path';

@Injectable()
export class DataPathsService {
  get dataDir() {
    return path.resolve(process.cwd(), '..', 'data');
  }

  get skillsDir() {
    return path.join(this.dataDir, 'skills');
  }

  get tmpDir() {
    return path.join(this.dataDir, 'tmp');
  }

  get dbPath() {
    return path.join(this.dataDir, 'app.db');
  }
}


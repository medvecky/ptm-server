import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../projects/projects.service';
import {ProjectRepository} from "../projects/project.repository";

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService, ProjectRepository],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

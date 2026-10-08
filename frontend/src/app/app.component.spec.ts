import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AppLoadService } from './services/app-load.service';
import { UserService } from './services/user.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: UserService,
          useValue: {
            login: () => ({ subscribe: () => undefined }),
            getRecords: () => ({ subscribe: () => undefined }),
            getUsers: () => ({ subscribe: () => undefined }),
            addUser: () => ({ subscribe: () => undefined }),
            deleteUser: () => ({ subscribe: () => undefined }),
          },
        },
        {
          provide: AppLoadService,
          useValue: {
            load: () => ({ subscribe: () => undefined }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize with bootstrap status text', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.appStatus).toContain('Bootstrapping');
  });
});

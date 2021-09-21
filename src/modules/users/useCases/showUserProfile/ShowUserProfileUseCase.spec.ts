import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it('Should be able to show user profile', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User test',
      email: 'user@test.com',
      password: '1234'
    })

    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile).toMatchObject({
      name: 'User test',
      email: 'user@test.com',
    })
    expect(userProfile).toHaveProperty('id');
  });

  it('Should not be able to show user profile with non-existent user', async () => {
    expect(async () => {
      await inMemoryUsersRepository.create({
        name: 'User test',
        email: 'user@test.com',
        password: '1234'
      })

      await showUserProfileUseCase.execute('non-existent');
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  });
});

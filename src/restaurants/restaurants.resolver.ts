import { Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';

@Resolver()
export class RestaurantsResolver {
  @Query((returns) => Restaurant)
  myRestaurant() {
    return true;
  }
}

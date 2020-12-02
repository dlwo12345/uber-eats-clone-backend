import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurants.entity';

@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  @Query((returns) => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    return [];
  }

  @Mutation((returns) => Boolean)
  createRestaurant(
    @Args() createRestaurantInput: CreateRestaurantDto,
  ): boolean {
    console.log('createRestaurantInput', createRestaurantInput);
    return true;
  }
}

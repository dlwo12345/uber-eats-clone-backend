import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  @Field((type) => String)
  @IsString()
  @Column()
  @Length(5, 10)
  name: string;

  @Field((type) => Boolean, {
    defaultValue: true, // graphql 스키마 상의 defaultvalue = true
    // nullable: true, // 필수값 해제
  })
  @Column({ default: true }) // database default value = true
  @IsOptional() // 필수값 제외
  @IsBoolean()
  isVegan: boolean;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  @Field((type) => String)
  @IsString()
  @Column()
  ownerName: string;

  @Field((type) => String)
  @IsString()
  @Column()
  categoryName: string;
}

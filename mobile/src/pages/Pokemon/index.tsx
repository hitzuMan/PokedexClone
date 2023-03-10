import React, { useMemo } from 'react';
import { Animated } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useRoute } from '@react-navigation/native';

import Block from '../../components/Block';
import Dots from '../../components/Dots';
import { POKEMON_SUMMARY_HEIGHT } from '../../constants';
import { Pokemon as PokemonType } from '../../types';
import { getColorByPokemonType } from '../../utils';

import Header from './Header';
import Summary from './Summary';
import Details from './Details';
import { Container, Content, DetailsContainer } from './styles';

export type RouteParams = {
  pokemon: PokemonType;
  from: 'card' | 'search';
};

const Pokemon = () => {
  const route = useRoute();

  const { pokemon } = route.params as RouteParams;

  const translateY = new Animated.Value(0);

  const animatedEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true },
  );

  const onHandlerStateChanged = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      let opened = false;

      const { translationY } = event.nativeEvent;

      if (translationY < -100) {
        opened = true;
      } else {
        opened = false;
        translateY.flattenOffset();
      }

      Animated.timing(translateY, {
        toValue: opened ? -POKEMON_SUMMARY_HEIGHT : 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        translateY.extractOffset();
      });
    }
  };

  const detailsStyle = {
    transform: [
      {
        translateY: translateY.interpolate({
          inputRange: [-POKEMON_SUMMARY_HEIGHT, 0, 200],
          outputRange: [-POKEMON_SUMMARY_HEIGHT, 0, 50],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  const backgroundColor = useMemo(
    () => getColorByPokemonType(pokemon.types[0].name),
    [pokemon.types],
  );

  const dotsStyle = {
    opacity: translateY.interpolate({
      inputRange: [-200, 0],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
  };

  return (
    <>
      <StatusBar style="light" backgroundColor="transparent" translucent />

      <Container
        style={{
          backgroundColor,
        }}
      >
        <Block />
        <Dots style={dotsStyle} />

        <Content>
          <Header pokemon={pokemon} translateY={translateY} />

          <Summary pokemon={pokemon} translateY={translateY} />

          <PanGestureHandler
            onGestureEvent={animatedEvent}
            onHandlerStateChange={onHandlerStateChanged}
          >
            <DetailsContainer style={detailsStyle}>
              <Details pokemon={pokemon} translateY={translateY} />
            </DetailsContainer>
          </PanGestureHandler>
        </Content>
      </Container>
    </>
  );
};

export default Pokemon;

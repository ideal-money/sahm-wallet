import * as React from 'react';
import { NavigationContainer, DrawerActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from './src/Home';
import Verify from './src/Verify';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} options={props => {
          return {
            title: 'Sahm Wallet',
            headerTitleStyle: {
              alignSelf: 'center'
            },
            headerLeft: () => {
              return (
                <TouchableOpacity
                  style={{ paddingLeft: 10 }}
                  onPress={() => {
                    props.navigation.dispatch(DrawerActions.toggleDrawer());
                  }}
                >
                  <Material
                    name="menu"
                    size={36}
                    color="#000"
                  />
            
                </TouchableOpacity>
              );
            },
            headerRight: () => {
              return (
                <TouchableOpacity
                  style={{ paddingRight: 10 }}
                  onPress={() => {
                    props.navigation.navigate('Wallet');
                  }}
                >
                  <Material
                    name="home"
                    size={36}
                    color="#000"
                  />
            
                </TouchableOpacity>
              );
            },
          }
        }} />
        <Stack.Screen name="Verify" component={Verify} options={{
          headerShown:false
        }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;


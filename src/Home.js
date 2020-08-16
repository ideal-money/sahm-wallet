import React, { Component } from 'react';
import { Linking, Alert } from 'react-native';
import Clipboard from "@react-native-community/clipboard";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import Wallet from './Wallet';
import Send from './Send';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { getKeyPair } from './utils';
import { EXPLORER_LINK, INVITE_LINK } from './config';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Transactions History"
        onPress={async () => {
          const address = (await getKeyPair()).address;
          Linking.openURL(EXPLORER_LINK + '/address/' + address + '/token_transfers');
          props.navigation.closeDrawer();
        }}
        icon={() => (
          <Material
            name="history"
            size={28}
            color="#000"
          />)
        }
      />
      <DrawerItem
        label="Copy Invite Link"
        onPress={async () => {
          const address = (await getKeyPair()).address;
          Clipboard.setString(INVITE_LINK + address);
          Alert.alert('Success', 'The invite link copied to clipboard!\nShare the link with your friends and earn Sahm tokens!');
          props.navigation.closeDrawer();
        }}
        icon={() => (
          <Material
            name="sitemap"
            size={28}
            color="#000"
          />)
        }
      />
      <DrawerItem
        label="Copy Private Key"
        onPress={async () => {
          const privateKey = (await getKeyPair()).privateKey;
          Clipboard.setString(privateKey);
          Alert.alert('Success', 'Your private key copied to clipboard!\nKeep your private key secure and do not share that with anyone.');
          props.navigation.closeDrawer();
        }}
        icon={() => (
          <Material
            name="key-outline"
            size={28}
            color="#000"
          />)
        }
      />
    </DrawerContentScrollView>
  );
}


class Home extends Component {

  render() {
    return (
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={props => <CustomDrawerContent {...props}/>}
      >
        <Drawer.Screen options={{
          title: 'Wallet',
          drawerIcon: () => 
            <Material
              name="home"
              size={28}
              color="#000"
            />
          
        }} name="Wallet" component={Wallet} />
        <Drawer.Screen options={{
          title: 'Send',
          drawerIcon: () => 
            <Material
              name="send-outline"
              size={28}
              color="#000"
            />
          
        }} name="Send" component={Send} />
      </Drawer.Navigator>
    );
  }
}


export default Home;
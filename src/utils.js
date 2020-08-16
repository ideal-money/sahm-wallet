import Web3 from 'web3';
import AsyncStorage from '@react-native-community/async-storage';
import { RPC_URL } from './config';
import {
  Alert
} from 'react-native';


async function getKeyPair() {
  try {
    const address = await AsyncStorage.getItem('address');
    const privateKey = await AsyncStorage.getItem('privateKey');
    if (address) {
      console.log(address, privateKey);
      return { address, privateKey };
    } else {
      const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
      const account = web3.eth.accounts.create();
      console.log('account', account);
      await AsyncStorage.setItem('address', account.address);
      await AsyncStorage.setItem('privateKey', account.privateKey);
      return {
        address: account.address,
        privateKey: account.privateKey,
      };
    }
  } catch (error) {
    Alert.alert(
      'Error',
      `Error loading account! ${error}`
    );
  }
}

function shortAddress(addr) {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export {
  getKeyPair,
  shortAddress
};
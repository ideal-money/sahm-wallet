import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  View,
  Linking
} from 'react-native';
import Clipboard from "@react-native-community/clipboard";
import Web3 from 'web3';
import { getKeyPair, shortAddress } from './utils';
import {
  RPC_URL,
  SAHM_ABI,
  SAHM_ADDRESS,
  EXPLORER_LINK
} from './config';

const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
var Sahm = new web3.eth.Contract(SAHM_ABI, SAHM_ADDRESS);

class Wallet extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      address: '...',
      eidiBalance: '...',
      sahmBalance: '...'
    };
  }

  async init() {
    const keypair = await getKeyPair();
    this.address = keypair.address;
    this.setState({
      address: this.address,
    });
    const eidiBalance = await web3.eth.getBalance(this.address);
    const sahmBalance = await Sahm.methods.balanceOf(this.address).call();
    this.setState({
      eidiBalance: parseFloat(web3.utils.fromWei(eidiBalance)).toFixed(3),
      sahmBalance: parseFloat(web3.utils.fromWei(sahmBalance)).toFixed(3),
    });
  }

  async componentDidMount() {
    const { navigation } = this.props;
    this._unsubscribe = navigation.addListener('focus', () => {
      this.init();
    });
    const onboarding = await AsyncStorage.getItem('onboarding');
    if (onboarding != 'false') {
      return navigation.navigate('Verify');
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <Image
          style={styles.logo}
          source={require('../assets/logo.png')}
        />
        <Text style={styles.addressLabel}>Wallet Address</Text>
        <TouchableOpacity onPress={() => {
          Clipboard.setString(this.address);
        }}>
          
          <Text style={styles.address}>{shortAddress(this.state.address)} 📋</Text>
        </TouchableOpacity>
        <Text style={styles.balance}>{this.state.sahmBalance}</Text>
        <Text style={styles.unit}>Sahm and {this.state.eidiBalance} Eidi</Text>
        
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Send')}
          >
           <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
             style={styles.button}
             onPress={async () => {
              const address = (await getKeyPair()).address;
              Linking.openURL(EXPLORER_LINK + '/address/' + address + '/token_transfers');
             }}
            >
           <Text style={styles.buttonText}>Transactions</Text>
          </TouchableOpacity>
        
        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    marginBottom: 10
  },
  balance: {
    fontSize: 80
  },
  addressLabel: {
    fontSize: 18,
    // marginBottom: 10
  },
  address: {
    fontSize: 27,
    marginBottom: 40
  },
  logo: {
    width: 64,
    height: 64,
    marginTop: 20,
    marginBottom: 30
  },
  unit: {
    fontSize: 15,
    marginBottom: 60
    // marginLeft: -10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#3b4654',
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    // marginTop: 40,
    width: 200
  },
  buttonText: {
    color: 'white',
    fontSize: 18
  },
})

export default Wallet;
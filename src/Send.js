import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  TextInput,
  Alert
} from 'react-native';
import Web3 from 'web3';
import { getKeyPair, shortAddress } from './utils';
import {
  RPC_URL,
  SAHM_ABI,
  SAHM_ADDRESS,
  GAS_LIMIT,
  GAS_PRICE
} from './config';

const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
var Sahm = new web3.eth.Contract(SAHM_ABI, SAHM_ADDRESS);

class Send extends Component {

  constructor(props) {
    super(props);
    this.state = {
      address: '',
      amount: '0',
      sending: false,
    };
  }

  async componentDidMount() {
    const keypair = await getKeyPair();
    const account = web3.eth.accounts.privateKeyToAccount(keypair.privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;
  }

  async send() {
    this.setState({
      sending: true,
    });
    const BN = web3.utils.BN;
    const amount = new BN(this.state.amount * 10**18).toString();
    const address = web3.utils.toChecksumAddress(this.state.address);
    const tx = await Sahm.methods.transfer(address, amount).send({
      from: web3.eth.defaultAccount,
      gas: GAS_LIMIT,
      gasPrice: GAS_PRICE
    });
    this.setState({
      sending: false,
      address: '',
      amount: '0'
    });
    Alert.alert('Success', 'Sahm sent successfully!');
  }
  async confirm() {
    if (this.state.sending) {
      return;
    }
    let address;
    try {
      address = web3.utils.toChecksumAddress(this.state.address);
      const claimed = await Sahm.methods.claimed(address).call();
      const owner = await Sahm.methods.owner().call();
      const unlimited = await Sahm.methods.unlimited(address).call();
      if (!claimed && !unlimited && owner.toLowerCase() != address.toLowerCase()) {
        return Alert.alert('Error', 'This address is not verified Sahm address');
      }
    } catch(e) {
      return Alert.alert('Error', 'Invalid address');
    }
    
    Alert.alert(
      'Confirm',
      `Send ${this.state.amount} Sahm to ${shortAddress(this.state.address)}?`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        { text: 'OK', onPress: () => this.send() }
      ],
      { cancelable: false }
    );
  }


  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.label}> To Address: </Text>
        <TextInput
          style={styles.address}
          placeholder="To Address"
          onChangeText={text => {
            this.setState({
              address: text
            });
          }}
          value={this.state.address}
        />
        <Text style={styles.label}> Amount: </Text>
        <TextInput
          style={styles.amount}
          keyboardType='numeric'
          placeholder="To Address"
          onChangeText={text => {
            let newText = '';
            let numbers = '0123456789.';
            for (var i=0; i < text.length; i++) {
              if(numbers.indexOf(text[i]) > -1 ) {
                newText = newText + text[i];
              }
            }
            this.setState({
              amount: newText
            });
          }}
          value={this.state.amount}
        />
        <TouchableOpacity
         style={styles.button}
         onPress={() => this.confirm()}
        >
         <Text style={styles.buttonText}>{this.state.sending ? 'Sending ...' : 'Send'}</Text>
        </TouchableOpacity>
                  
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    // alignItems: 'center',
    marginTop: 20,
    padding: 20
  },
  label: {
    fontSize: 20,
    marginBottom: 10,
    marginTop: 20
  },
  address: {
    height: 40,
    borderWidth: 1,
    width: '100%',
    backgroundColor: '#fff'
  },
  amount: {
    height: 40,
    borderWidth: 1,
    width: '100%',
    backgroundColor: '#fff'
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b4654',
    width: '100%',
    marginBottom: 10,
    marginTop: 40,
    height: 40
  },
  buttonText: {
    color: 'white',
    fontSize: 18
  },
  
})

export default Send;
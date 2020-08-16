import createKeccakHash from 'keccak';
import secp256k1 from 'secp256k1';
import Web3 from 'web3';
import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Image,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { getKeyPair, shortAddress } from './utils';
import {
  RPC_URL,
  VERIFICATION_URL,
  RELAYER_URL,
  SAHM_ADDRESS,
  SAHM_ABI,
  BRIGHTID_ADDRESS,
  BRIGHTID_ABI,
  BRIGHTID_LINK
} from './config';

const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
var Sahm = new web3.eth.Contract(SAHM_ABI, SAHM_ADDRESS);
var BrightID = new web3.eth.Contract(BRIGHTID_ABI, BRIGHTID_ADDRESS);

class Verify extends Component {

  constructor(props) {
    super(props);
    this.state = {
      address: null,
      parent: null,
      processRequested: false,
      linked: false,
      sponsored: false,
      verified: false,
      verificationPublished: false,
      eidiReceived: false,
      sahmReceived: false,
      verifyClicked: false,
    };
  }


  async componentDidMount() {
    this.address = (await getKeyPair()).address.toLowerCase();
    this.setState({ address: this.address});
    this.waitForParent();
  }

  async waitForProcess() {
    console.log('waitForProcess');
    console.log(VERIFICATION_URL + this.address + '?t=' + Date.now());
    const resp = await fetch(VERIFICATION_URL + this.address + '?t=' + Date.now());
    const data = await resp.json();
    if (data.error) {
      if (data.errorMessage == 'contextId not found') {
        this.setState({ linked: false });
      } else if (data.errorMessage == 'user is not sponsored') {
        this.setState({ linked: true });
        console.log('linked');
        this.setState({ sponsored: false });
      } else if (data.errorMessage == 'user can not be verified for this context') {
        console.log('not verified');
        this.setState({ linked: true });
        this.setState({ sponsored: true });
        this.setState({ verified: false });
        // if users are not verified in brightid yet, they can not do anything
        // in sahm wallet and should first get verified in brightid
        return;
      }
      return setTimeout(() => this.waitForProcess(), 3000);
    }
    console.log('sponsored');
    this.setState({ linked: true });
    this.setState({ sponsored: true });
    this.setState({ verified: true });
    const verificationPublished = await BrightID.methods.verifications(this.address).call();
    if (verificationPublished > 0) {
      this.setState({ verificationPublished: true });
    }
    const eidiBalance = await web3.eth.getBalance(this.address);
    const sahmBalance = await Sahm.methods.balanceOf(this.address).call();
    console.log('balances:', eidiBalance, sahmBalance);
    if (eidiBalance > 0) {
      this.setState({ eidiReceived: true });
    }
    if (sahmBalance > 0) {
      this.setState({ sahmReceived: true });
      await AsyncStorage.setItem('onboarding', 'false');
      const { navigation } = this.props;
      return setTimeout(() => navigation.navigate('Home'), 2000);
    };
    return setTimeout(() => this.waitForProcess(), 3000);
  }

  async requestProcess(parent) {
    const message = this.address.replace('0x', '') + parent.replace('0x', '');
    const h = new Uint8Array(createKeccakHash('keccak256').update(message, 'hex').digest());
    let priv = (await getKeyPair()).privateKey;
    priv = new Uint8Array(Buffer.from(priv.slice(2), 'hex'));
    const sig = secp256k1.ecdsaSign(h, priv);
    const r = '0x' + Buffer.from(Object.values(sig.signature.slice(0, 32))).toString('hex');
    const s = '0x' + Buffer.from(Object.values(sig.signature.slice(32, 64))).toString('hex');
    const v = sig.recid + 27;
    const resp = await fetch(RELAYER_URL + '/process', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ addr: this.address, parent, r, s, v })
    });
    const data = await resp.json();
    if (data.success == true) {
      this.waitForProcess();
      this.setState({ processRequested: true });
    }
  }

  async waitForParent() {
    const resp = await fetch(RELAYER_URL + '/parents/' + this.address);
    const data = await resp.json();
    if (data.success) {
      this.setState({ parent: data.parent });
      this.requestProcess(data.parent);
    } else {
      setTimeout(() => this.waitForParent(), 3000);
    }
  }

  async verify() {
    Linking.openURL(BRIGHTID_LINK + this.address);
    this.setState({ verifyClicked: true });
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.logo}
          source={require('../assets/logo.png')}
        />
        {this.state.verifyClicked || this.state.parent ? (
          <View>
            <Text style={styles.checks}>
              {this.state.address ? '✓' : '✗'} Address set {this.state.address && shortAddress(this.state.address)}
            </Text>
            <Text style={styles.checks}>
              {this.state.parent ? '✓' : '✗'} Parent set {this.state.parent && shortAddress(this.state.parent)}
            </Text>
            <Text style={styles.checks}>
              {this.state.processRequested ? '✓' : '✗'} Process requested
            </Text>
            <Text style={styles.checks}>
              {this.state.linked ? '✓' : '✗'} Address linked to your BrightID
            </Text>
            <Text style={styles.checks}>
              {this.state.sponsored ? '✓' : '✗'} Your BrightID is sponsored
            </Text>
            <Text style={styles.verified}>
              {this.state.verified ? '✓' : '✗'} BrightID verified you
            </Text>
            <Text style={styles.verified}>
              {this.state.verificationPublished ? '✓' : '✗'} The verification published on IDChain
            </Text>
            <Text style={styles.verified}>
              {this.state.eidiReceived ? '🎉' : '✗'} Your Eidi tokens recevied
            </Text>
            <Text style={styles.verified}>
              {this.state.eidiReceived ? '🎊' : '✗'} Your Sahm tokens recevied
            </Text>
          </View>
        ) : (
          <View style={styles.messageContainer}>
            <Text style={styles.welcome}>Welcome to Sahm Wallet</Text>
            <Text style={styles.message}>Anyone can have only a single Sahm wallet.</Text>
            <Text style={styles.message}>Please verify your uniqnuess using</Text>
            <Text style={styles.message}>BrightID to create your own one and</Text>
            <Text style={styles.message}>claim your Sahm tokens.</Text>
          </View>
        )}
        {!this.state.linked && (
          <TouchableOpacity
             style={styles.button}
             onPress={() => this.verify()}
            >
             <Text style={styles.buttonText}>Verify Using BrightID</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  messageContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcome: {
    fontSize: 25,
    marginBottom: 10
  },
  message: {
    fontSize: 16
  },
  checks: {
    fontSize: 16
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#3b4654',
    padding: 10,
    marginBottom: 10,
    marginTop: 40
  },
  buttonText: {
    color: 'white',
    fontSize: 18
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20
  }
})

export default Verify;
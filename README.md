PrivForm
========

A site for secure form creation and collection


About
=====

PrivForm aims to provide a platform for people concerned about privacy to create and distribute forms with no worry
about anyone sniffing or altering their responses, including the ones running the site. It achieves this by use of
*public key cryptography*, specifically PGP. When a user creates a form, a new *keypair* is generated in the client's
browser. The private half of that keypair is never transmitted over a network if PrivForm can help it. When the user
creates the form, the public key is sent to the PrivForm backend, along with the form definition. When a user opens
the form they're sent that public key, and when they complete it the result is encrypted before being sent to the 
backend. The stored form responses are not readable by anyone except the holder of the private part of the keypair.


Process Details
===============

### Form Creation

1. The form creator uses the composer to create a form definition. It can be edited later.
2. The creator is prompted for a strong password, which is used to generate their keypair.
3. The creator downloads their private key and copies their public key's fingerprint
4. The creator distributes a link to the form, along with the pubkey fingerprint


### Form Filling

1. The user navigates to the form, the form definition and public key are fetched from the backend
2. The pubkey's fingerprint is calculated and displayed to the user, they are prompted to check that it matches the 
   creator's
3. The user completes the form, it cannot be edited later.
4. The user's response is serialized and encrypted using the pubkey
5. The encrypted response is sent to the backend and stored.

### Response Collection

1. The creator navigates to the management page and is prompted with a nonce.
2. They can either encrypt that nonce with their privkey out of band, or if they're willing they can "upload" (it never
   actually touches the network) their privkey and the page will encrypt it for them.
3. The encrypted nonce is sent to the backend, which uses the pubkey to decrypt it and compare it to the expected value,
   if they match the user is authenticated.
4. The user is dropped on a page allowing them to edit their form, as well as view results. They are again given the 
   option to upload their key, if they do they can view results in browser and download cleartext versions of their 
   results. If they are unwilling they can download a raw json file and manage themselves. In the future we may provide
   transparent tooling for those use cases.

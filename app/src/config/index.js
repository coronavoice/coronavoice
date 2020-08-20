export const config = {
  default: {
    name: 'Corona Voice',
    helpDescription: `We want to know how the coronavirus epidemic is impacting your work and to find out more about the challenges you face and what things there are which can offer a helping hand at this difficult time.
    
It’s quick and easy to leave your feedback, simply click on the site most relevant to you.`, // helpDescription sets the intro text in the "need help" tab on the website 
    logo: '/img/logos/selogo.svg', // the logo to use
    themeColor: '#00a9ce', // the color of the top bar/action bar on to show on mobile browsers that support this
    api: 'https://api.example.com/', // the URL/address of the backend, with the trailing slash
    baseUrl: 'https://example.com', // the URL of the app, with the trailing slash
    packageName: 'com.example.coronavoice', // the package name of the app, usually in the form of the reversed domain name
    dynamicLink: 'coronavoice.page.link' // dynamic link base URL, you can find it on Firebase console
  }
}

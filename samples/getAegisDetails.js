const input = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL29yY2EuZXdpc2UuY29tIiwiYWVnaXMiOiJodHRwczovL3Bkdi5ld2lzZS5jb206ODQ0MyIsInRlbmFudCI6ImRldiIsIm9yaWdpbnMiOiJodHRwczovL21vbmV5bWFuYWdlci5ld2lzZS5jb20iLCJzdWIiOiJyY2FsdW5zYWciLCJlbWFpbCI6InJjYWx1bnNhZ0Bld2lzZS5jb20iLCJpYXQiOjE1MzYzMTQyMjUsImV4cCI6MjkzNDgwMzE0NzMsInNlcnZpY2VzIjpbIkNBVDAwMSIsIkFDQTAwMSJdLCJpbnN0aXR1dGlvbnMiOlsxMjAxLDEwMjksNDAzNSwxOTA5XSwiaGFzaGVzIjpbIjlkZjc0ODNiNTg5Y2RmZWY4NGMwODYxZmY3OGU3ZjMzYTU3YzJmZjgiXSwic3dhbiI6Imh0dHBzOi8vMzA1Y2JkYjEtMjdiZi00NTE4LWIzNTQtZjQ5MWFmMGM5MzNjLm1vY2sucHN0bW4uaW8ifQ.GQPq8nqxPkhzMzRyMQSXpAc3HVArTMx3eCcQNOivteIqGOjkH20F-8guGGBB6fG1SNPfETqDoaG5Dm7tIB7VHFqJPyfU2eUqTcHlfLvK3yjPfSCboH18NPgkfnolH_gP2Q6TXxQw9T9E6lczJMhR_2sSJvVyH5zkczbYJrGtJxxwdEcF-zRIWWCfsvpvfvd94Ao_Yd5qs5SI-1cCF1D0blfBwv40NhDyF7q8mk4WVQ9XxBaOL81BC4_oFXKZXfT47gulEMwfawuc-7uJtVZvVftR4dCDzB4D9jOnOAscaBIABZ2NXTfaneeCHWcsGmD9EDOX78svam9cxkwc_MpQkw`;
// const input = 'https://pdv.ewise.com:8443/';
// const input = 'https://pdv.ewise.com:8443/fake-url';
// const input = 'not a url';
// const input = 12345;

// const details = ew.getAegisDetails(input);
// const details = ew.runBrowser(input);
const details = ew.initOTA(input).getInstitutions(1201);

const errorCallback = msg => error => console.log(`Error Encountered from ${msg}:`, error);
const successCallback = msg => data => console.log(`Data Received from ${msg}:`, data);

// Monadic Implementation
details.fork(errorCallback('monad'), successCallback('monad'));

// Promise Implementation
details.toPromise().then(successCallback('promise')).catch(errorCallback('promise'));
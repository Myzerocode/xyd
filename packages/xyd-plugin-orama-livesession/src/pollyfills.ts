export function sendBeacon(endpoint: string, body?: any) {
  console.log(body, "SEND BODY DATA")

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(endpoint, body)
      return
    }

    // fetch(endpoint, {
    //   method: 'POST',
    //   body,
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })
    //   // @todo: handle errors with retries
    //   .catch((error) => {
    //     console.error(error)
    //   })
  }
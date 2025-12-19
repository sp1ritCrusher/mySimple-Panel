export function getDifferences(currentData, newData) {
    currentData = currentData.toObject();
    newData = newData.toObject();
      const diff = {};
        for (const key in newData) {
        if (newData[key] !== currentData[key]) {
        diff[key] = { 
          current: currentData[key],
          new: newData[key]
        }
        delete diff._id;
      }
    }
    return diff;
}

export function getIp(req) {
   return req.headers["x-forwarded-for"] || req.socket.remoteAddress; 
  }

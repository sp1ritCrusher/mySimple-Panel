export function getDifferences(currentData, newData) {
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
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
  return ip || "0.0.0.0";
}


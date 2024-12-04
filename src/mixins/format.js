export default {
  methods: {
    maskEmail (val) {
      val = val.toString()
      const visibleChar = val.split('@')[1]
      const maskedChar = Array(val.split('@')[0].length + 1).join('*')

      return maskedChar + '@' + visibleChar
    },
    maskPhone (val) {
      val = val.toString()
      const visibleChar = val.substr(Math.max(0, val.length - 4), val.length)
      const maskedChar = Array(Math.max(0, val.length - 3)).join('*')

      return maskedChar + visibleChar
    }
  }
}

const axios = require('axios');
axios.get('http://localhost:3000/api/v1/areas')
  .then(res => {
    if (res.data.success && res.data.data) {
      console.log('List of area names:');
      res.data.data.forEach(a => {
        console.log(`- "${a.name}" (en: "${a.name_en}", mr: "${a.name_mr}") ID: ${a.id}`);
      });
    }
  })
  .catch(err => {
    console.error('Error:', err.message);
  });

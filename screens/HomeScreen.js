import axios from "axios";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Caption, List, Snackbar } from "react-native-paper";

export default function HomeScreen ({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects()
    // This function is called when the screen first opens, when the screen gains focus, and when the flat list is refreshed.
    const subscribe = navigation.addListener('focus', () => {
      loadProjects();
    });
    return subscribe;
  }, [])

  function loadProjects () {
    axios.get('http://localhost:1337/api/projects')
      .then(({ data }) => {
        setProjects(data.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError('An error occurred, please try again later.');
        setLoading(false);
      });
  }

  return (
    <View>
      {!loading && !projects.length && <Caption style={{textAlign: 'center', marginTop: 10}}>You have no projects</Caption>}
      <FlatList
        data={projects}
        renderItem={({ item }) => (
          <List.Item 
            key={item.id}
            title={item.attributes.title}
            description={item.attributes.date}
            onPress={() => navigation.navigate('Editor', {
                project: item
            })}
            />
        )}      
        refreshing={loading}
        onRefresh={loadProjects}
        style={{width: '100%', height: '100%'}}
      />
      <Snackbar visible={error.length > 0} onDismiss={() => setError('')}>{error}</Snackbar>
    </View>
  )
}
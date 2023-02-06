// chatcity by ram
// inspired by old skool msn chat and https://www.youtube.com/watch?v=kJfwjGQY99M&list=PLKhlp2qtUcSZsGkxAdgnPcHioRr-4guZf&index=12&ab_channel=RoadsideCoder

// todo:
// - testing
// - clean up code
// - deploy deploy deploy

// - future features
// - create public chatrooms
// - add chatroom commands and settings
// - add admin functionality for chat admin
// - add admin functionality for site admin
import { Spinner } from '@chakra-ui/react';
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import './App.scss';
const Home = lazy(() => import('./pages/Home/Home'));
const Chat = lazy(() => import('./pages/Chat/Chat'));
const Room = lazy(() => import('./pages/Room/Room'));

const App = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="App">
      <Suspense
        fallback={
          <div>
            <Spinner />
          </div>
        }
      >
        <Switch>
          <Route path="/" exact>
            {user ? <Chat /> : <Home />}
          </Route>
          <Route path="/room/:id" exact>
            {user ? <Room /> : <Redirect to="/" />}
          </Route>
          <Route path="*">
            {/* catch all route */}
            <Redirect to="/" />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
};

export default App;

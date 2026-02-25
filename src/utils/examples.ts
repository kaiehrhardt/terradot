export const EXAMPLE_GRAPH = `digraph Example {
  rankdir=TB;
  
  // Styling
  node [shape=box, style=filled, fillcolor=lightblue];
  edge [color=gray];
  
  // Define root
  Root [fillcolor=lightgreen, label="Root Node"];
  
  // Define hierarchy
  Root -> A;
  Root -> B;
  Root -> C;
  
  A -> D;
  A -> E;
  
  B -> E;
  B -> F;
  
  C -> G;
  
  D -> H;
  E -> H;
  F -> I;
  G -> I;
  
  H -> End;
  I -> End;
  
  End [shape=doublecircle, fillcolor=lightcoral, label="End Node"];
}`;

export const SIMPLE_EXAMPLE = `digraph Simple {
  A -> B;
  A -> C;
  B -> D;
  C -> D;
}`;

export const COMPLEX_EXAMPLE = `digraph Dependencies {
  rankdir=LR;
  
  node [shape=box, style="rounded,filled", fillcolor=white];
  
  App [fillcolor=lightgreen];
  
  App -> Router;
  App -> Store;
  App -> API;
  
  Router -> HomePage;
  Router -> ProfilePage;
  Router -> SettingsPage;
  
  HomePage -> UserList;
  HomePage -> Dashboard;
  
  ProfilePage -> UserProfile;
  ProfilePage -> UserSettings;
  
  UserList -> API;
  Dashboard -> API;
  UserProfile -> API;
  UserSettings -> Store;
  
  Store -> LocalStorage;
  API -> HTTPClient;
  
  HTTPClient [fillcolor=lightblue];
  LocalStorage [fillcolor=lightblue];
}`;

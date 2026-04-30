import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Skills from "@/pages/Skills";
import Skill from "@/pages/Skill";
import Lesson from "@/pages/Lesson";
import Task from "@/pages/Task";
import Import from "@/pages/Import";
import Settings from "@/pages/Settings";
import { AppLayout } from "@/components/AppLayout";

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/skills/:skillId" element={<Skill />} />
          <Route path="/skills/:skillId/lessons/:lessonId" element={<Lesson />} />
          <Route path="/skills/:skillId/tasks/:taskId" element={<Task />} />
          <Route path="/import" element={<Import />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

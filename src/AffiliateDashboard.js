<<<<<<< HEAD
// placeholder: your actual AffiliateDashboard component code goes here
=======

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "./AppRoutes";
import { saveAs } from "file-saver";

export default function AffiliateDashboard() {
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState({ name: "", url: "" });
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("member");

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        const userRole = data.user.user_metadata?.role || "member";
        setRole(userRole);
      }
    };

    const fetchLinks = async () => {
      const { data, error } = await supabase.from("affiliate_links").select();
      if (error) {
        console.error("Error fetching links:", error.message);
      } else {
        setLinks(data);
      }
    };

    fetchUser();
    fetchLinks();
  }, []);

  const handleAuth = async () => {
    const fn = isLogin ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { data, error } = await fn({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { role: "member" }
      }
    });
    if (error) alert(error.message);
    if (data?.user) setUser(data.user);
  };

  const resetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) alert(error.message);
    else alert("Password reset email sent!");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole("member");
  };

  const addLink = async () => {
    if (role !== "admin") return alert("Only admins can add or update links.");
    if (form.name && form.url) {
      if (editingId) {
        const { data, error } = await supabase
          .from("affiliate_links")
          .update({ name: form.name, url: form.url })
          .eq("id", editingId);

        if (error) {
          console.error("Error updating link:", error.message);
        } else {
          setLinks(links.map((link) => (link.id === editingId ? data[0] : link)));
          setForm({ name: "", url: "" });
          setEditingId(null);
        }
      } else {
        const { data, error } = await supabase.from("affiliate_links").insert([form]);

        if (error) {
          console.error("Error adding link:", error.message);
        } else {
          setLinks([...links, ...data]);
          setForm({ name: "", url: "" });
        }
      }
    }
  };

  const deleteLink = async (id) => {
    if (role !== "admin") return alert("Only admins can delete links.");
    const { error } = await supabase.from("affiliate_links").delete().eq("id", id);
    if (error) {
      console.error("Error deleting link:", error.message);
    } else {
      setLinks(links.filter((link) => link.id !== id));
    }
  };

  const editLink = (link) => {
    if (role !== "admin") return alert("Only admins can edit links.");
    setForm({ name: link.name, url: link.url });
    setEditingId(link.id);
  };

  const exportCSV = () => {
    const csvContent = ["name,url"].concat(
      links.map(link => `${link.name},${link.url}`)
    ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "affiliate_links.csv");
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center p-10 space-y-4">
        <h2 className="text-xl font-bold">{isLogin ? "Login" : "Sign Up"}</h2>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={handleAuth}>{isLogin ? "Login" : "Create Account"}</Button>
        <p className="text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button className="underline text-blue-600" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
        <Button variant="link" onClick={resetPassword} className="text-xs text-blue-600">
          Forgot Password?
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Affiliate Link Manager</h2>
        <div className="text-sm text-gray-500 flex items-center gap-3">
          <span>{user.email} ({role})</span>
          <Button size="sm" variant="outline" onClick={logout}>Logout</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Venue Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Affiliate URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
        <Button onClick={addLink}>{editingId ? "Update Link" : "Add Link"}</Button>
      </div>

      <div className="text-right">
        <Button variant="outline" onClick={exportCSV}>Export as CSV</Button>
      </div>

      <div className="grid gap-4">
        {links.map((link, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">{link.name}</h3>
              <p className="text-sm text-blue-600">
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.url}
                </a>
              </p>
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" size="sm" onClick={() => editLink(link)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteLink(link.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
>>>>>>> deafecd4fcc2dd0ac310a2ac7427c034ae678f47

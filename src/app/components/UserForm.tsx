'use client'

const saveUser = async (email: string, user_name: string, team_name: string) => {
  try {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, user_name, team_name }),
    });
    
    if (!response.ok) throw new Error("Failed to save player to roster.");
    const result = await response.json();
    console.log("Player added:", result);
  } catch (error) {
    console.error("Error adding player:", error);
  }
};

const UserForm = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const user_name = formData.get("user_name") as string;
    const team_name = formData.get("team_name") as string;
    saveUser(email, user_name, team_name);
    
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="email" placeholder="Email" required />
      <input type="text" name="user_name" placeholder="User Name" required />
      <input type="text" name="team_name" placeholder="Team Name" required />
      <button type="submit">Submit</button>
    </form>
  );
};

export default UserForm;

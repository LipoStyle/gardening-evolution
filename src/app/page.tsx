import LoginForm from "@/components/auth/LoginForm";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Welcome to Gardening Evolution</h1>

        {/* shell gives contrast on top of the image */}
          <LoginForm />
      </div>
    </main>
  );
}

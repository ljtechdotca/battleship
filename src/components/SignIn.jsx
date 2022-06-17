import styles from "./SignIn.module.scss";

const SignIn = ({ onSignIn }) => {
  return (
    <form className={styles.root} onSubmit={onSignIn}>
      <p>Sign in with a unique nickname.</p>
      <input
        minLength={2}
        maxLength={32}
        type="text"
        name="nickname"
        id="nickname"
        placeholder="Nickname"
        required
      />
      <div className={styles.base}>
        User color
        <input type="color" name="color" id="color" required />
      </div>
      <button className="purple">Sign in</button>
    </form>
  );
};

export default SignIn;

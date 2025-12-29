import { signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, type User } from "firebase/auth";

export const useAuth = () => {
  // akses firebase auth dari nuxt app
  const { $auth } = useNuxtApp();

  // akses router nuxt
  const router = useRouter();

  // state user dan loading auth
  const user = useState<User | null>("user", () => null);
  const authLoading = useState<boolean>("authLoading", () => true);

  // inisialisasi auth dan pantau perubahan status autentikasi
  const initAuth = () => {
    // kembalikan promise untuk menunggu penyelesaian inisialisasi
    return new Promise<void>((resolve) => {
      // pantau perubahan status autentikasi
      onAuthStateChanged($auth, (currentUser) => {
        // perbarui state user dan loading
        user.value = currentUser;
        authLoading.value = false;
        resolve();
      });
    });
  };

  // fungsi login
  const login = async (email: string, pass: string) => {
    // coba login dengan email dan password
    try {
      // jalankan fungsi signInWithEmailAndPassword dari firebase auth
      await signInWithEmailAndPassword($auth, email, pass);
      router.push("/dashboard");
    } catch (error: any) {
      // jika terjadi error, lempar error tersebut
      throw error;
    }
  };

  // fungsi logout
  const logout = async () => {
    // coba logout
    try {
      // jalankan fungsi signOut dari firebase auth
      await signOut($auth);
      router.push("/");
    } catch (error) {
      // jika terjadi error, lempar error tersebut
      throw error;
    }
  };

  // fungsi ubah data profil
  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    // pastikan user sudah login
    if (!$auth.currentUser) return;
    await updateProfile($auth.currentUser, {
      // perbarui data profil
      displayName,
      photoURL,
    });
    // perbarui state user
    user.value = { ...$auth.currentUser };
  };

  // kembalikan state dan fungsi yang dibutuhkan
  return {
    user,
    authLoading,
    initAuth,
    login,
    logout,
    updateUserProfile,
  };
};

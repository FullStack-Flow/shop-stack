interface VendorSignUpFormProps {
  onSuccess: () => void;
}
export default function VendorSignUpForm({
  onSuccess: _onSuccess,
}: VendorSignUpFormProps) {
  //     const navigate = useNavigate();
  //   const [loading, setLoading] = useState(false);
  //   const [step, setStep] = useState<1 | 2>(1);
  //   const [showPassword, setShowPassword] = useState(false);
  //   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //   const form = useForm({
  //     defaultValues: {
  //       name: '',
  //       email: '',
  //       password: '',
  //       confirmPassword: '',
  //       storeName: '',
  //       storeDescription: '',
  //       contactPhone: '',
  //       countryCode: 'BD',
  //       address: '',
  //     },
  //     validators: {
  //       onSubmit: vendorRegisterSchema.parse,
  //     },
  //     onSubmit: async ({ value }) => {
  //       setLoading(true);
  //       try {
  //         const result = await registerVendor({
  //           data: value as VendorRegisterInput,
  //         });

  //         if (result.success) {
  //           toast.success('Vendor account created successfully!');
  //           toast.info(`Your shop "${result.shop.name}" is pending approval.`);
  //           onSuccess?.();
  //           // Redirect to vendor dashboard - shop access after approval
  //           navigate({ to: '/' });
  //         }
  //       } catch (err) {
  //         toast.error(err instanceof Error ? err.message : 'Registration failed');
  //       } finally {
  //         setLoading(false);
  //       }
  //     },
  //   });

  return <div>VendorSignUpForm</div>;
}

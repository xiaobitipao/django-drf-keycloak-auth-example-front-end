import FileDownlaod from "@/components/FileDownload";
import FileUpload from "@/components/FileUpload";
import ExampleGet from "@/components/ExampleGet";
import ExamplePost from "@/components/ExamplePost";

export default function App() {

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Demo</h2>

      <ExampleGet name="組織情報" api="/api/salesforce_master/organizations" />
      <hr style={{ margin: '20px 0', border: '1px solid #ccc' }} />

      <FileUpload />
      <hr style={{ margin: '20px 0', border: '1px solid #ccc' }} />

      <FileDownlaod />
      <hr style={{ margin: '20px 0', border: '1px solid #ccc' }} />

      {/* <ExampleGet name="Get Example" api="/example/hello/" /> */}

      {/* <ExamplePost name="Post Example" api="/example/echo/" /> */}
    </div>
  );
}

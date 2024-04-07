package sg.edu.nus.iss.backend.repository;

import java.io.InputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;

@Repository
public class ImageRepository {
    
    @Value("${s3.bucket.name}")
    private String bucketName;

    @Autowired
    private AmazonS3 s3;

    public String saveImageTo3T(String id, ObjectMetadata metadata, InputStream is) throws SdkClientException, AmazonServiceException{

        String key = "userprofile/%s".formatted(id);

        PutObjectRequest putReq = new PutObjectRequest(bucketName, key, is, metadata);
        putReq = putReq.withCannedAcl(CannedAccessControlList.PublicRead);

        s3.putObject(putReq);

        return s3.getUrl(bucketName, key).toExternalForm();
    }
}
